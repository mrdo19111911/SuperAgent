# React 18 + Vite Best Practices (Compressed for Lan Dev-FE)

Type-safe React patterns with TanStack Query, Zustand, and STMAI API envelope integration.

---

## P0: Wait for CONTRACT_DRAFT.md

**LUẬT SỐ 1:** Không convert HTML sang React cho đến khi `CONTRACT_DRAFT.md` được finalize.
"Fake API = fix twice" — Xây trên fake API = làm lại.

---

## Pattern 1: API Integration (Type-Safe Envelope)

```typescript
// src/lib/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;  // P2: No hardcode!

export interface APIEnvelope<T> {
  success: boolean;
  data: T;
  meta?: { page?: number; total?: number; [key: string]: any };
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.response.use(
  response => response.data,  // Extract data from axios wrapper
  error => Promise.reject(error)
);
```

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
      return response.data.order;  // P2: Extract from envelope!
    }
  });
};
```

---

## Pattern 2: Environment Configuration (P2 Prevention)

**.env.local (NOT committed)**
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENV=development
```

**.env.production (committed)**
```bash
VITE_API_BASE_URL=https://api.stmai.com/api/v1
VITE_ENV=production
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

## Pattern 3: State Management

**Local State (default)**
```typescript
function OrderForm() {
  const [formData, setFormData] = useState({ name: '', quantity: 1 });
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Global State (Zustand) - when shared across routes**
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

**When to use Zustand:** Auth state, UI state shared across routes, real-time notifications count
**When NOT to use:** Form data (local state), server data (TanStack Query cache)

---

## Pattern 4: Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: (error: Error) => ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to Sentry/monitoring
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback(this.state.error!);
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

---

## Pattern 5: XSS Prevention (P1 CRITICAL)

**✅ SAFE - React auto-escapes**
```typescript
function UserProfile({ userName }: { userName: string }) {
  return <h1>Hello {userName}</h1>;  // Auto-escaped
}
```

**❌ UNSAFE - innerHTML bypasses escaping**
```typescript
// P1 VIOLATION: -20 points!
function UserProfile({ userBio }: { userBio: string }) {
  return <div dangerouslySetInnerHTML={{ __html: userBio }} />;  // XSS!
}
```

**✅ SAFE - Use markdown library**
```typescript
import ReactMarkdown from 'react-markdown';

function UserProfile({ userBio }: { userBio: string }) {
  return <ReactMarkdown>{userBio}</ReactMarkdown>;  // Sanitized
}
```

---

## Pattern 6: Accessibility (P3 Prevention)

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

**❌ BAD - Icon-only without label (P3: -10 points!)**
```typescript
function DeleteButton() {
  return <button onClick={handleDelete}><TrashIcon /></button>;  // Screen reader: "button" (no context)
}
```

---

## Pattern 7: Component Size Limit

**Rule: Max 150 lines per component**

```typescript
// ❌ BAD: 200 lines - TOO LARGE
function OrderPage() {
  // 50 lines state + 50 lines handlers + 100 lines JSX
}

// ✅ GOOD: Extracted to sub-components
function OrderPage() {  // 60 lines
  const { data: order } = useGetOrder(orderId);
  return (
    <div>
      <OrderHeader order={order} />  {/* 40 lines */}
      <OrderItems items={order.items} />  {/* 50 lines */}
      <OrderSummary total={order.total} />  {/* 30 lines */}
    </div>
  );
}
```

---

## Common Mistakes (Quick Reference)

| Mistake | Problem | Fix |
|---------|---------|-----|
| Hardcode API URL in code | Breaks in production | Use `import.meta.env.VITE_API_BASE_URL` |
| Parse raw response | Contract drift when BE changes | Parse `response.data.order` not `response.order` |
| `innerHTML` with user data | XSS vulnerability (P1: -20) | Use React's `{variable}` (auto-escaped) |
| Icon-only button | Screen reader cannot announce (P3: -10) | Add `aria-label="Action name"` |
| Component >150 lines | Hard to maintain/test | Extract to sub-components |
| Zustand for form data | Overkill, complexity | Use local `useState` |

---

## Checklist Before PR (W1: Build pass first time)

```
[ ] API calls use apiClient with APIEnvelope<T>
[ ] No hardcoded URLs - all from import.meta.env.VITE_*
[ ] No dangerouslySetInnerHTML with user data
[ ] All icon-only buttons have aria-label
[ ] Components <150 lines (extracted if larger)
[ ] Error boundary wraps feature module
[ ] TypeScript strict mode, no `any` (W2: +15)
[ ] E2E tests pass (Playwright)
```
