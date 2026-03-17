# Error & Rescue Map (Section 2)

**This is the section that catches silent failures. It is NOT optional.**

---

## Purpose

For every new method, service, or codepath that can fail, map:
1. What can go wrong
2. What exception class is raised
3. Whether it's rescued
4. What action is taken when rescued
5. What the user sees

---

## Template

### Part 1: Error Enumeration

```
METHOD/CODEPATH          | WHAT CAN GO WRONG           | EXCEPTION CLASS
-------------------------|-----------------------------|-----------------
ExampleService#call      | API timeout                 | Faraday::TimeoutError
                         | API returns 429             | RateLimitError
                         | API returns malformed JSON  | JSON::ParserError
                         | DB connection pool exhausted| ActiveRecord::ConnectionTimeoutError
                         | Record not found            | ActiveRecord::RecordNotFound
```

### Part 2: Rescue Strategy

```
EXCEPTION CLASS              | RESCUED?  | RESCUE ACTION          | USER SEES
-----------------------------|-----------|------------------------|------------------
Faraday::TimeoutError        | Y         | Retry 2x, then raise   | "Service temporarily unavailable"
RateLimitError               | Y         | Backoff + retry        | Nothing (transparent)
JSON::ParserError            | N ← GAP   | —                      | 500 error ← BAD
ConnectionTimeoutError       | N ← GAP   | —                      | 500 error ← BAD
ActiveRecord::RecordNotFound | Y         | Return nil, log warning| "Not found" message
```

---

## Rules for This Section

### 1. `rescue StandardError` is ALWAYS a smell

**Why it's bad:**
- Catches SystemExit, SignalException (breaks graceful shutdown)
- Hides programming errors (NoMethodError, ArgumentError)
- Makes debugging impossible
- Can't have different strategies for different errors

**DO:**
```ruby
RETRIABLE_ERRORS = [
  Faraday::TimeoutError,
  Faraday::ConnectionFailed,
  Redis::CannotConnectError
]

def call
  perform_operation
rescue *RETRIABLE_ERRORS => e
  retry_with_backoff(e)
rescue Stripe::CardError => e
  handle_card_error(e)
end
```

**DON'T:**
```ruby
def call
  perform_operation
rescue StandardError => e  # ← SMELL
  logger.error(e.message)
  nil
end
```

---

### 2. `rescue => e` with only logging is insufficient

**Bad:**
```ruby
rescue => e
  Rails.logger.error(e.message)  # ← Only message, no context
end
```

**Good:**
```ruby
rescue Stripe::CardError => e
  logger.error(
    event: 'payment_card_declined',
    order_id: order.id,
    user_id: user.id,
    card_last4: payment_method.last4,
    error: e.message,
    backtrace: e.backtrace.first(5)
  )
  raise PaymentDeclinedError.new("Card declined: #{e.user_message}")
end
```

**Log the full context:**
- What was being attempted
- With what arguments
- For what user/request
- Stack trace (at least first 5 lines)

---

### 3. Every rescued error must do one of three things

1. **Retry with backoff**
2. **Degrade gracefully** with user-visible message
3. **Re-raise** with added context

**"Swallow and continue" is almost never acceptable.**

**Example of each:**

**Retry:**
```ruby
def call_api
  retries = 0
  begin
    api.fetch_data
  rescue Faraday::TimeoutError => e
    retries += 1
    if retries <= 3
      sleep(2 ** retries)  # Exponential backoff
      retry
    else
      raise APIUnavailableError, "API timeout after 3 retries"
    end
  end
end
```

**Degrade gracefully:**
```ruby
def get_recommendations
  recommendation_service.call(user)
rescue RecommendationService::UnavailableError => e
  logger.warn("Recommendations unavailable", user_id: user.id, error: e)
  # Degrade: show generic popular items instead
  Product.popular.limit(10)
end
```

**Re-raise with context:**
```ruby
def process_order(order)
  allocate_inventory(order)
rescue InventoryExhausted => e
  raise OrderProcessingError.new(
    "Cannot process order #{order.id}: #{e.message}",
    original_error: e,
    order: order
  )
end
```

---

### 4. For each GAP (unrescued error that should be rescued)

**Specify:**
- The rescue action
- What the user should see

**Example:**

**GAP found:**
```
JSON::ParserError | N ← GAP | — | 500 error ← BAD
```

**Recommended fix:**
```ruby
rescue JSON::ParserError => e
  logger.error(
    event: 'api_malformed_response',
    api_endpoint: endpoint,
    raw_response: response.body.truncate(500),
    error: e.message
  )
  raise APIIntegrationError.new(
    "API returned malformed response",
    user_message: "Service temporarily unavailable. Please try again.",
    original_error: e
  )
end

# User sees: "Service temporarily unavailable. Please try again."
# Team sees: Full context in logs + alert if happens >5 times/hour
```

---

## LLM/AI Service Calls (Special Attention)

For every LLM call, consider these 5 failure modes:

| Failure Mode | What Happens | Exception | Rescue Strategy |
|--------------|--------------|-----------|-----------------|
| **Malformed response** | LLM returns invalid JSON | `JSON::ParserError` | Retry 1x, then fallback to default |
| **Empty response** | LLM returns empty string | Custom check | Retry 1x, then fallback |
| **Hallucinated structure** | LLM returns valid JSON but wrong schema | `KeyError`, `NoMethodError` | Schema validation before use |
| **Model refusal** | LLM refuses to answer | Response contains "I cannot..." | Detect refusal, log, show error to user |
| **Timeout** | LLM takes >30s | `Faraday::TimeoutError` | Retry 1x with longer timeout, then fail |

**Example:**
```ruby
class AIRecommendationService
  TIMEOUT = 30.seconds

  def call(user_context)
    response = anthropic_client.messages.create(
      model: 'claude-sonnet-4.5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: build_prompt(user_context) }],
      timeout: TIMEOUT
    )

    # 1. Empty response
    if response.content.blank?
      logger.warn('LLM returned empty response', user_id: user_context[:user_id])
      return fallback_recommendations
    end

    # 2. Malformed JSON
    begin
      json = JSON.parse(response.content)
    rescue JSON::ParserError => e
      logger.error('LLM returned malformed JSON', response: response.content, error: e)
      return fallback_recommendations
    end

    # 3. Hallucinated structure (schema validation)
    unless valid_schema?(json)
      logger.error('LLM returned invalid schema', response: json, expected: schema)
      return fallback_recommendations
    end

    # 4. Model refusal
    if refusal_detected?(response.content)
      logger.warn('LLM refused to answer', prompt: build_prompt(user_context))
      raise AIRefusalError.new("AI service cannot fulfill this request")
    end

    parse_recommendations(json)

  rescue Faraday::TimeoutError => e
    # 5. Timeout
    logger.error('LLM timeout', timeout: TIMEOUT, error: e)
    raise AITimeoutError.new("AI service took too long to respond")
  end

  private

  def valid_schema?(json)
    json.is_a?(Array) &&
      json.all? { |item| item.key?('product_id') && item.key?('reason') }
  end

  def refusal_detected?(content)
    content.match?(/I cannot|I'm unable to|I don't have access/i)
  end

  def fallback_recommendations
    Product.popular.limit(5)
  end
end
```

---

## Example: Complete Error & Rescue Map

### PaymentService

**Part 1: Error Enumeration**

```
METHOD                          | WHAT CAN GO WRONG              | EXCEPTION CLASS
--------------------------------|--------------------------------|-------------------------
PaymentService#charge_card      | Card declined                  | Stripe::CardError
                                | Rate limit (429)               | Stripe::RateLimitError
                                | API timeout                    | Faraday::TimeoutError
                                | Network error                  | Faraday::ConnectionFailed
                                | Invalid request                | Stripe::InvalidRequestError
                                | Stripe API down (503)          | Stripe::APIError
                                | DB connection timeout          | ActiveRecord::ConnectionTimeoutError
                                | Order not found                | ActiveRecord::RecordNotFound
                                | User not found                 | ActiveRecord::RecordNotFound
```

**Part 2: Rescue Strategy**

```
EXCEPTION CLASS                  | RESCUED? | RESCUE ACTION                      | USER SEES
---------------------------------|----------|------------------------------------|-----------------------
Stripe::CardError                | Y        | Log, store in payments table       | "Card declined: [reason]"
Stripe::RateLimitError           | Y        | Exponential backoff, retry 3x      | Nothing (transparent)
Faraday::TimeoutError            | Y        | Retry 1x with 60s timeout          | "Payment processing, please wait"
Faraday::ConnectionFailed        | Y        | Retry 2x, then fail                | "Payment service unavailable"
Stripe::InvalidRequestError      | Y        | Log error, notify team             | "Invalid payment information"
Stripe::APIError                 | Y        | Retry 2x, then fail                | "Payment service unavailable"
ConnectionTimeoutError           | N ← GAP  | —                                  | 500 error ← BAD
RecordNotFound (Order)           | Y        | Return 404                         | "Order not found"
RecordNotFound (User)            | Y        | Return 404                         | "User not found"
```

**Part 3: Gaps & Recommendations**

**GAP 1: ConnectionTimeoutError (DB)**
- **Impact:** User sees 500 error, payment may be in unknown state
- **Fix:** Rescue → Retry DB connection 1x → If fails, mark payment as "pending_verification"
- **User sees:** "Payment submitted, verification in progress"
- **Background job:** Verify payment status with Stripe, update order

---

## Output Format

For each new service/method in the plan:

```markdown
### [ServiceName]#[method_name]

**Failure modes identified:**
1. [Failure mode 1] → [Exception class]
2. [Failure mode 2] → [Exception class]
...

**Rescue strategy:**
| Exception | Rescued? | Action | User Sees |
|-----------|----------|--------|-----------|
| ... | ... | ... | ... |

**GAPS found:**
- ❌ [Exception] not rescued → **Recommend:** [specific rescue action]
- ❌ [Exception] swallowed → **Recommend:** [log context + re-raise]

**LLM-specific concerns:** (if applicable)
- ⚠️ Malformed response: [How handled?]
- ⚠️ Empty response: [How handled?]
- ⚠️ Schema validation: [Present?]
```

---

**STOP.** AskUserQuestion once per GAP found. Present options, recommend fix, explain WHY.

---

**Token Count:** ~1,900 tokens
