# MODEL_ROUTING.md — Bảng Phân Công Model cho Từng Agent

> **Nguyên tắc:** Dùng model đủ mạnh cho task, không dùng thừa.
> Chi phí = Intelligence × Task Complexity. Optimize cả hai.

---

## Bảng Phân Công

### Core Agents
| Agent | Model | Lý Do |
|-------|-------|-------|
| **Dũng PM** | `claude-sonnet` | Điều phối phức tạp, cần hiểu business context sâu |
| **Tùng Diag** | `claude-sonnet` | AUDIT 12 chiều, chẩn đoán Root Cause phức tạp |
| **Phúc SA** | `claude-sonnet` | Architecture reasoning, DB optimization phức tạp |
| **Mộc Arch-Chal** | `claude-sonnet` | Phản biện kiến trúc cần phân tích sâu |
| **Xuân Spec-Rev** | `claude-sonnet` | Validation logic contract, cần hiểu business rules |
| **Conan Req-Aud** | `claude-sonnet` | Business analysis, domain knowledge phức tạp |
| **Sơn QA** | `claude-sonnet` | Security testing, edge case reasoning |
| **Nam Observability** | `claude-sonnet` | SLO analysis, distributed tracing |
| **Nhiên Janitor** | `claude-haiku` | Pattern matching đơn giản, không cần reasoning |

### Dev Agents
| Agent | Model | Lý Do |
|-------|-------|-------|
| **Thúc Dev-TS** | `claude-sonnet` | NestJS/Prisma coding, TDD implementation |
| **Lân Dev-FE** | `claude-sonnet` | React/Next.js frontend development |
| **Quang Designer** | `claude-sonnet` | UI/UX design reasoning |
| **Huyền FE-QA** | `claude-sonnet` | E2E test design, accessibility analysis |
| **Hoàng Dev .NET** | `claude-sonnet` | C#/.NET coding |
| **Huyền Dev-py** | `claude-sonnet` | Python/FastAPI coding |
| **Tuấn Dev Go** | `claude-sonnet` | Go concurrency, Kafka patterns |

### Research Agents
| Agent | Model | Lý Do |
|-------|-------|-------|
| **Cừa Feature-R** | `claude-sonnet` | Feature research, competitive analysis |
| **Hiếu Arch-R** | `claude-sonnet` | Architecture research, pattern evaluation |
| **Nghĩa Stack-R** | `claude-sonnet` | Tech stack research, library evaluation |
| **Đôn Synth** | `claude-sonnet` | Research synthesis, cross-domain analysis |
| **Ngữ Pitfall-R** | `claude-sonnet` | Security/pitfall research, white-hat analysis |

### User-Side Agents
| Agent | Model | Lý Do |
|-------|-------|-------|
| **Châu Pana UX** | `claude-sonnet` | UX domain expertise |
| **Thanh Lại** | `claude-sonnet` | Deployment, ops, security audit |
| **User Agent** | `claude-sonnet` | PO/stakeholder representation |

---

## Khi Nào Dùng Model Cao Hơn

Trong trường hợp ngoại lệ, Dũng PM có thể upgrade tạm thời:
- Task liên quan đến Security Critical (CVE zero-day, data breach)
- Thiết kế kiến trúc cho ML system phức tạp (T5 AI agents)
- Bất kỳ task nào mà Sonnet thất bại sau 2 lần thử

---

## Chi Phí Ước Tính (per Sprint)

```
~22 Sonnet agents × N tasks × avg tokens = $$$
1   Haiku agent   × cleanup × avg tokens = $ (ước tính < 1% tổng chi phí)
```
