# React 18 + Vite Best Practices

Type-safe React patterns with TanStack Query, Zustand, and STMAI API envelope integration.

---

## Pattern 1: API Integration (Type-Safe)

**Setup: API Client with Envelope Parsing**

```typescript
// src/lib/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface APIEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    total?: number;
    [key: string]: any;
  };
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor to enforce envelope
apiClient.interceptors.response.use(
  response => response.data,  // Extract data from axios wrapper
  error => Promise.reject(error)
);
```

**Usage: TanStack Query with Type-Safe Envelope**

```typescript
// src/features/orders/api/getOrder.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient, APIEnvelope } from '@/lib/apiClient';

interface Order {
  id: string;
  tenant_id: string;
  status: 'pending' | 'confirmed' | 'completed';
  total: number;
}

export const useGetOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const response = await apiClient.get<APIEnvelope<{ order: Order }>>(
        `/orders/${orderId}`
      );
      return response.data.order;  // Extract order from envelope
    }
  });
};
```

**Component Usage**

```typescript
// src/features/orders/OrderDetail.tsx
import { useGetOrder } from './api/getOrder';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function OrderDetail({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error } = useGetOrder(orderId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!order) return <NotFound />;

  return (
    <div>
      <h1>Order {order.id}</h1>
      <p>Status: {order.status}</p>
      <p>Total: ${order.total}</p>
    </div>
  );
}
```

---

## Pattern 2: Environment Configuration

**.env.local (NOT committed)**

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENV=development
```

**.env.production (committed)**

```bash
# .env.production
VITE_API_BASE_URL=https://api.stmai.com/api/v1
VITE_ENV=production
```

**Usage in Code**

```typescript
// ✅ GOOD - Read from env
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌ BAD - Hardcoded URL
const apiUrl = 'http://localhost:3000/api/v1';
```

**Env Type Safety**

```typescript
// src/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV: 'development' | 'staging' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Pattern 3: State Management (Local → Global)

**Start with Local State**

```typescript
// ✅ GOOD - Local state for component-only data
function OrderForm() {
  const [formData, setFormData] = useState({ name: '', quantity: 1 });

  const handleSubmit = () => {
    // Submit formData
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Upgrade to Global State (Zustand) When Needed**

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  tenantId: string | null;
  login: (user: User, tenantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenantId: null,
  login: (user, tenantId) => set({ user, tenantId }),
  logout: () => set({ user: null, tenantId: null })
}));
```

**Usage**

```typescript
// Any component can access auth
function Header() {
  const { user, logout } = useAuthStore();

  if (!user) return <LoginButton />;

  return (
    <div>
      <span>Welcome {user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**When to use Zustand:**
- Auth state (user, tenant, tokens)
- UI state shared across routes (sidebar open/close)
- Real-time notifications count

**When NOT to use Zustand:**
- Form data (use local state)
- Server data (use TanStack Query cache)

---

## Pattern 4: Error Boundaries

**Per-Feature Error Boundary**

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to monitoring service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }

      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <pre>{this.state.error?.message}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage**

```typescript
// src/App.tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import { OrdersFeature } from './features/orders';

function App() {
  return (
    <ErrorBoundary>
      <OrdersFeature />
    </ErrorBoundary>
  );
}
```

---

## Pattern 5: XSS Prevention

**✅ SAFE - React auto-escapes**

```typescript
function UserProfile({ userName }: { userName: string }) {
  // React escapes {userName} automatically
  return <h1>Hello {userName}</h1>;
}
```

**❌ UNSAFE - innerHTML bypasses escaping**

```typescript
function UserProfile({ userBio }: { userBio: string }) {
  // DANGEROUS - XSS vulnerability if userBio contains <script>
  return <div dangerouslySetInnerHTML={{ __html: userBio }} />;
}
```

**✅ SAFE - Use markdown library instead**

```typescript
import ReactMarkdown from 'react-markdown';

function UserProfile({ userBio }: { userBio: string }) {
  // Safe - ReactMarkdown sanitizes by default
  return <ReactMarkdown>{userBio}</ReactMarkdown>;
}
```

---

## Pattern 6: Accessibility

**✅ GOOD - Button with text label**

```typescript
function DeleteButton() {
  return (
    <button onClick={handleDelete}>
      <TrashIcon />
      <span>Delete</span>
    </button>
  );
}
```

**✅ GOOD - Icon-only with aria-label**

```typescript
function DeleteButton() {
  return (
    <button onClick={handleDelete} aria-label="Delete order">
      <TrashIcon />
    </button>
  );
}
```

**❌ BAD - Icon-only without label**

```typescript
function DeleteButton() {
  // Screen readers cannot announce this button's purpose
  return (
    <button onClick={handleDelete}>
      <TrashIcon />
    </button>
  );
}
```

---

## Pattern 7: Component Size Limit

**Rule: Max 150 lines per component**

**Before (200 lines - TOO LARGE)**

```typescript
function OrderPage() {
  // 50 lines of state
  // 50 lines of handlers
  // 100 lines of JSX

  return (
    <div>
      {/* Massive JSX */}
    </div>
  );
}
```

**After (Extracted to sub-components)**

```typescript
// OrderPage.tsx (60 lines)
function OrderPage() {
  const { data: order } = useGetOrder(orderId);

  return (
    <div>
      <OrderHeader order={order} />
      <OrderItems items={order.items} />
      <OrderSummary total={order.total} />
    </div>
  );
}

// OrderHeader.tsx (40 lines)
function OrderHeader({ order }: { order: Order }) {
  return <header>...</header>;
}

// OrderItems.tsx (50 lines)
function OrderItems({ items }: { items: Item[] }) {
  return <ul>...</ul>;
}
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Hardcode API URL in code | Breaks in production | Use `import.meta.env.VITE_API_BASE_URL` |
| Parse raw response | Contract drift when BE changes envelope | Parse `response.data.order` not `response.order` |
| `innerHTML` with user data | XSS vulnerability | Use React's `{variable}` (auto-escaped) |
| Icon-only button | Screen reader cannot announce | Add `aria-label="Action name"` |
| Component >150 lines | Hard to maintain, test | Extract to sub-components |
| Zustand for form data | Overkill, complexity | Use local `useState` |

---

## Checklist Before PR

```
[ ] API calls use apiClient with type-safe APIEnvelope<T>
[ ] No hardcoded URLs - all from import.meta.env.VITE_*
[ ] No dangerouslySetInnerHTML with user data
[ ] All icon-only buttons have aria-label
[ ] Components <150 lines (extracted if larger)
[ ] Error boundary wraps feature module
[ ] TypeScript strict mode, no `any`
[ ] E2E tests pass (Playwright)
```
