# From Zero to This App: a React Guide

This guide assumes you know nothing about React, but that you're comfortable with general software engineering — types, functions, HTTP, async code, backend architecture. It's written against one real codebase (`uyum-web`), and every example is real code from that app, not an invented toy example. By the end, you should be able to read any file in this project and know exactly why it's shaped the way it is — and rebuild it yourself.

Where it helps, concepts are anchored to backend/NestJS equivalents, since that's the background this guide assumes.

---

## Part 1 — React Fundamentals

### 1.1 The entry point

Every web page starts with an empty HTML file. React's job is to take over one element in that page and render your app into it.

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
```

`index.html` has one empty `<div id="root"></div>`. `createRoot(...).render(...)` is the one line that says "find that DOM node, and put whatever this render tree produces inside it." Everything else in the app is just building what gets rendered there.

`StrictMode` is a dev-only helper — it deliberately double-invokes some code paths to help surface bugs (particularly code that shouldn't run more than once but does — see 1.8). It has no effect in production.

### 1.2 A component is just a function

```tsx
// src/routes/root-layout.tsx
import { Outlet } from '@tanstack/react-router'

function RootLayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default RootLayout
```

A "component" has no special syntax — it's an ordinary function. The one rule: its name is capitalized. That's not stylistic; it's how React tells apart "a custom component" (`<RootLayout />`) from "a plain HTML tag" (`<div />`) when it sees the JSX. Whatever the function `return`s is what gets drawn on screen.

### 1.3 JSX is not HTML

The markup-looking syntax inside `return (...)` is JSX. It looks like HTML but compiles down to plain JavaScript function calls that build a description of the UI. Three consequences that trip up everyone the first time:

- `className` instead of `class` — `class` is a reserved word in JS.
- `{}` drops into real JavaScript inside the markup. `{count}` isn't the string `"count"`, it's the JS variable `count` being interpolated — same idea as `${count}` in a template string.
- A component can only return **one** root element. Wrapping multiple siblings in `<>...</>` (a *Fragment*) satisfies that rule without adding a real, empty `<div>` to the DOM.

### 1.4 Props — passing data into a component

Props are a component's parameters. The backend analogy: a component is a function, props are its argument.

The mechanism matters more than it looks. When you write:

```tsx
<MintOperationInfo id="abc123" />
```

that JSX compiles to a plain function call: `MintOperationInfo({ id: "abc123" })`. Every attribute you write in JSX gets bundled into **one object**, and React always calls your component with that single object as its only argument — never multiple positional arguments, no matter how many props you pass.

```tsx
// src/features/mint-operations/components/MintOperationInfo.tsx
function MintOperationInfo({ id }: { id: string }) {
  // ...
}
```

`{ id }` destructures the incoming object; `: { id: string }` is the TypeScript type of that object. Writing `function MintOperationInfo(id: string)` (no braces) would be wrong — React still calls it as `MintOperationInfo({ id: "abc123" })`, so a bare `id` parameter would receive the *whole object*, not the string.

### 1.5 State — a component's memory

If a component needs to remember something across renders (and re-render when it changes), a plain variable doesn't work — reassigning it doesn't tell React the UI needs to redraw. `useState` is the tool for this:

```tsx
const [page, setPage] = useState(1)
```

(real code, from `src/features/mint-operations/hooks/UseMintOperationsList.ts`)

Two return values: the current value (`page`), and a setter (`setPage`) that updates it *and* tells React to re-render. The `1` passed into `useState(1)` is the **initial** value only — used on the very first render, then ignored. On every subsequent render, `page` comes back as whatever it currently is, not `1` again, even though the line `useState(1)` re-runs every time (because the whole component function re-runs on every render). React keeps the actual value tied to that component instance, outside of the function body.

**The functional update form.** You'll often see the setter called with a function instead of a value:

```tsx
setCount((prev) => prev + 1)
```

`prev` isn't special syntax — it's just a parameter name (could be anything). The mechanism: `useState`'s setter is overloaded. Pass it a plain value, and it sets state to exactly that. Pass it a *function*, and React calls that function for you, handing it the current value, and uses whatever it returns as the new state. This matters when multiple updates could be queued before a re-render happens — `setCount(count + 1)` twice both read the same stale `count` from the current render's closure and only net +1 total; `setCount((prev) => prev + 1)` twice both read the true current value at the moment each one actually runs.

### 1.6 Custom hooks — pulling logic out of a component

A "hook" is a plain function, with one convention: its name starts with `use`. That's not decoration — React's rules (and its rule-checking tooling) rely on that prefix to know a function is allowed to call other hooks internally, and that certain rules apply to it (hooks can only be called at a function's top level, never inside a loop or conditional — React tracks state by call order, so calling a hook conditionally would desync it).

Custom hooks exist for Single Responsibility: separate *how something behaves* from *how it's rendered*. Every hook in this app follows the same shape — own the state and logic, return only what the component needs to render:

```ts
// src/features/mint-operations/hooks/UseCreateMintForm.ts (shape, simplified)
export function useCreateMintForm() {
  const createMintMutation = useMutation({ mutationFn: createMintOperation, /* ... */ })
  const form = useForm({ /* ... */ })

  return {
    form,
    isLoading: createMintMutation.isPending,
    errorMessage: getErrorMessage(createMintMutation.error),
    clearError: createMintMutation.reset,
  }
}
```

The component that calls this (`CreateMintForm.tsx`) never touches `useMutation` or knows how errors get turned into messages — it just asks the hook for `form`, `isLoading`, `errorMessage`, `clearError`, and renders. That's the Dependency Inversion idea from OOP, translated: the component depends on an abstraction (whatever the hook returns), not on the concrete mechanism underneath.

### 1.7 Closures — how a zero-argument function "knows" what to do

This one is a genuinely new JS concept if you haven't hit it before, not just new React syntax. From `useAuthStore` / `useOnLoginSuccess`:

```ts
export function useOnLoginSuccess() {
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)

  return (data: LoginResponse) => {
    setToken(data.authToken)
    navigate({ to: "/mint-operations" })
  }
}
```

The returned function takes `data` as its only parameter — yet it also uses `setToken` and `navigate`, neither of which were passed in. It doesn't need them passed in, because it was *defined inside* `useOnLoginSuccess`, and a function defined inside another function keeps access to that outer function's variables even after being handed out from it. That's a closure. It's the same mechanism behind every `field.handleChange`, every mutation's `onSuccess` callback, every event handler in this app that "just knows" what to update.

### 1.8 The render-purity rule: no side effects during render

This is the single most common category of bug in this codebase's history, and it's worth understanding precisely, not just avoiding by superstition.

React expects a component's render (the function body, top to bottom, up to the `return`) to be a **pure calculation**: given the current props/state, compute what to render. No side effects — no calling a state setter, no starting a network request, no mutating something outside the component — during that calculation.

A broken example, close to a real bug hit in this project:

```ts
// WRONG
if (loginMutation.isSuccess) {
  setToken(loginMutation.data.authToken)
}
```

placed directly in a hook's body (not inside a callback). This runs on *every* render, not once when login actually succeeds — `isSuccess` stays `true` forever once it's true, so any re-render for any unrelated reason calls `setToken` again with stale data. React's `StrictMode` (1.1) exists partly to catch exactly this, by deliberately double-invoking renders in development.

A worse variant caused an actual infinite loop:

```ts
// WRONG — infinite render loop
if (!form.state.canSubmit || form.state.values.email === "") {
  setIsDisabled(true)
} else {
  setIsDisabled(false)
}
```

Reading `form.state.*` during render subscribes the component to that state; calling a setter unconditionally, every render, based on values that can genuinely change between renders, means the render never stabilizes — React caps the number of iterations and throws rather than freeze the tab.

**The fix is never "wrap it in `useEffect`" as a first instinct — it's usually "this doesn't need its own state at all."** Both examples above are values *entirely derived* from other state. The actual fix:

```ts
onSuccess: (data) => { setToken(data.authToken) }   // tie it to the real event
// ...
isDisabled: !form.state.canSubmit                    // compute inline, don't store it
```

General rule to carry forward: if you're about to call a setter based on reading some *other* reactive value, stop and ask whether that value should just be computed directly, every render, instead of stored.

### 1.9 Context — sharing a value without passing it through every layer

So far, the only way data has moved between components is props — a parent passes data down explicitly. Context is a different mechanism: a `Provider` component makes a value available to *every* descendant, no matter how deep, without threading it through each intermediate component's props.

```tsx
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
</QueryClientProvider>
```

`useMutation`/`useQuery` (Part 4) need access to one shared `QueryClient` instance to read/write a cache. Instead of passing it as a prop into every component that uses those hooks, `QueryClientProvider` hands it to all of them at once — internally, those hooks call `useContext` to reach up and grab whatever was provided above them in the tree. Backend analogy: a provider registered at the module level in NestJS, injectable anywhere in that module without threading it through every constructor by hand.

One consequence: Context only flows *downward*. A component can only see a value from a `Provider` if it's rendered *inside* it in the JSX tree — which is why `<RouterProvider>` has to wrap the whole app, not sit beside it.

### 1.10 `useEffect` — and why this app barely uses it

`useEffect` is React's hook for synchronizing a component with something *outside* React's own rendering — subscribing to a browser API, manually touching the DOM, or (historically, and this is the trap) fetching data by hand. It runs after render, and can return a cleanup function.

This app has essentially no raw `useEffect`, and that's deliberate, not an oversight. Every side-effect-shaped need already has a purpose-built hook that owns it correctly:

- Data fetching → `useQuery` (Part 4), not a manual fetch-in-`useEffect`.
- Mutations → `useMutation`.
- Form/URL sync → TanStack Form and TanStack Router manage their own internals.
- Even the mint-operation polling behavior (checking a record's status every second until it resolves) — the textbook `useEffect` + `setInterval` use case — is `useQuery`'s `refetchInterval` option (4.4), not hand-rolled.

`useEffect` still has a real place — subscribing to `window.resize`, focusing an input on mount, integrating a non-React library — just none of them came up in this app.

---

## Part 2 — Talking to the Backend

### 2.1 Zod — validation that actually runs

TypeScript types vanish the moment code compiles — they give you zero protection against bad user input or an API response that doesn't match what you assumed. Zod schemas are real JavaScript values that inspect data *while the program runs*.

```ts
// src/features/auth/schemas/login-schema.ts
import * as z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

`z.infer<typeof loginSchema>` generates a TypeScript type directly from the schema, so the validation rules and the type can never drift apart — one definition, two uses.

Match your validation to what the backend actually enforces, not what "feels right." `register-schema.ts` requires `password.min(6)` because the backend does (`@MinLength(6)` on `RegisterRequestDto`); `login-schema.ts` doesn't, because the backend never checks a length rule on login (an old password created under looser rules must still work). Copying register's rule onto login would be inventing a constraint the API doesn't have.

Also worth knowing: Zod v4 moved format validators like `.email()` to top-level functions — `z.email()`, not the older `.string().email()` chain — and added `z.templateLiteral()` for narrower literal-shaped strings, though a plain `.regex()` plus a type assertion at the boundary (2.3) is often the more pragmatic choice than reshaping a whole schema around one field's type precision.

### 2.2 The API client layer — axios, instances, and interceptors

`fetch` has a gotcha almost everyone hits once: **it does not throw on HTTP error responses.** A 401 or 500 still resolves successfully; `response.ok` is `false`, but you have to check that yourself, or a failed request silently looks like it succeeded. axios throws automatically on non-2xx — one of the reasons it was chosen here.

```ts
// src/clients/core.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});
```

`import.meta.env.VITE_API_URL` is Vite's environment variable mechanism — only variables prefixed `VITE_` get bundled into client code that ships to the browser; anything else in `.env` stays server/build-side only, specifically so a secret can't accidentally leak into JS anyone can read in devtools.

**Interceptors** are functions that run on every request or response made through one axios instance — the mechanism for cross-cutting concerns that shouldn't be duplicated into every API call:

```ts
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith("/auth");
    if (axios.isAxiosError(error) && error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

Without the request interceptor, every single endpoint function would need to remember to attach the auth header itself — easy to forget on some new endpoint written six months from now. Without the response interceptor, an expired/invalid token would just make every subsequent request quietly fail forever, with nothing ever recovering the app to a working state.

Two things worth noticing in that response interceptor:
- `useAuthStore.getState()`, not the `useAuthStore()` hook — this file isn't a component or a hook, so hooks aren't callable here. Zustand stores expose a non-hook `.getState()`/`.setState()` API specifically for reading/writing state from plain code (2.2, and again in Part 5).
- The `/auth` exclusion — a wrong password on the login form *also* returns 401, and that's not an expired session; it needs to show "invalid credentials" on the login page, not trigger a redirect-to-login (which the user's already on) and wipe a token they may not even have.

`window.location.href`, not a router navigation, is deliberate here too: this file can't import the router instance without creating a circular import (`router.tsx` → route components → their hooks → `clients/core.ts` → `router.tsx`). A full reload for this one rare event (an actually-expired session) is an acceptable trade for avoiding that cycle.

### 2.3 Payload and response types — the wire contract, kept separate from validation

```ts
// src/clients/payloads.ts
export type RegisterPayload = { email: string; password: string }
export type LoginPayload = { email: string; password: string }   // NOT aliased to RegisterPayload
```

`RegisterPayload` and `LoginPayload` are structurally identical today — and are still defined as two independent types, not one aliased to the other. They represent different concerns that happen to currently match: register enforces a password minimum server-side, login doesn't. If they were aliased and register's rules changed, login's type would silently change too. Compare this to:

```ts
export type MeResponse = RegisterResponse   // this alias IS correct
```

This one *is* a legitimate alias — verified against the backend source, `/users/me` literally returns `new RegisterResponseDto(user)`, the exact same DTO class register uses, not a coincidentally-matching shape. The rule: same shape today doesn't automatically mean "alias it" — check *why* it's the same shape before deciding.

The client functions in `clients/core.ts` are deliberately "dumb" — no validation, no business logic, just the wire call:

```ts
export async function login(data: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
}
```

`apiClient.post<LoginResponse>(...)` — that generic type argument matters. Without it, `response.data` is typed `any` by default, and TypeScript silently lets it through as whatever the function's return type claims, without ever actually checking the shape matches.

---

## Part 3 — Forms

### 3.1 `useForm` and why `defaultValues` matters more than it looks

```ts
const form = useForm({
  defaultValues: { email: "", password: "" },
  validators: { onChange: loginSchema, onMount: loginSchema },
  onSubmit: async ({ value }) => {
    loginMutation.mutate(value)
  },
})
```

`defaultValues` isn't just "what the fields start as" — it's how TanStack Form infers the *type* of your form's data in the first place. Omit it, and `value` inside `onSubmit` types as `unknown`, because there's nothing for TypeScript to infer the shape from.

`validators.onChange` re-validates on every keystroke; `validators.onMount` validates once immediately when the form first renders. Without `onMount`, a completely empty form looks "valid" on load — not because empty is actually acceptable, but because no validation has run yet at all (no `change` event has fired), so there are simply no known errors yet.

### 3.2 `form.Field` — a function as a child, and why

```tsx
<form.Field name="email">
  {(field) => (
    <Input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
    />
  )}
</form.Field>
```

The child of `form.Field` is a *function*, not fixed JSX. This lets TanStack Form re-render only this one field when its value changes, not the whole form — typing in the email field shouldn't force the password field to re-render too. `field.handleChange` is this field's version of a `useState` setter; `field.state.meta.errors` is where Zod's messages land, per field, automatically.

A layered gate for showing an error, from `LoginForm.tsx`:

```tsx
{field.state.value &&
  field.state.meta.isTouched &&
  field.state.meta.errors.length > 0 && (
    <Typography.Text type="danger">{field.state.meta.errors[0]?.message}</Typography.Text>
  )}
```

Without `isTouched`, a form-level validator (one schema validating the whole object) would flag *every* field with an error the instant you type into *any* field — because the object genuinely isn't valid yet while other fields are still empty. Gating on `isTouched` means a field's error only shows once the user has actually interacted with *that* field.

### 3.3 The reactivity trap: `form.state` is not automatically reactive

This is subtle enough to be worth its own section — it caused a real bug that looked correct and compiled cleanly.

```ts
get state() {
  return formApi.store.state;
}
```

That's TanStack Form's actual implementation (from the library source) of what `form.state` is: a plain getter, no subscription attached. Reading `form.state.canSubmit` directly in a component gives you a snapshot *at that render* — it does not make the component re-render again just because the form's internal state changed later. Typing into a field only re-renders the isolated `form.Field` around it, not the parent component, so a parent reading `form.state.canSubmit` directly would show a stale value forever after the first render.

The actual fix is `form.Subscribe`, which *does* wire up a real subscription:

```tsx
<form.Subscribe selector={(state) => state.canSubmit}>
  {(canSubmit) => (
    <Button htmlType="submit" disabled={!canSubmit}>Login</Button>
  )}
</form.Subscribe>
```

General lesson, not specific to this one library: something *looking* like it comes from a reactive source doesn't guarantee it behaves reactively — check whether a real subscription mechanism (a selector, a `useSelector`/`useSyncExternalStore`-style hook) is actually involved, or whether it's just a plain property read.

---

## Part 4 — Server State (TanStack Query)

### 4.1 `useMutation` vs `useQuery` — lazy vs. eager

`useQuery` fires automatically the moment a component mounts. `useMutation` is deliberately lazy — nothing happens until you explicitly call `.mutate(...)`, usually from a form's submit handler:

```ts
const registerMutation = useMutation({ mutationFn: register })
// nothing happens until:
registerMutation.mutate(formValues)
```

`isPending`, `isSuccess`, `isError`, `error`, `data` are all tracked for you — no manual `useState` for loading/error state, and no manual try/catch around the call.

### 4.2 Query keys — the cache's identity

```ts
useQuery({ queryKey: ["me"], queryFn: getMe })
```

`queryKey` isn't a label, it's the cache's address. Two components calling `useQuery` with the *exact same key* (compared by deep equality, not by object reference — two separately-written `["me"]` arrays in different files do match) share one cache entry: whichever mounts second gets the already-fetched data back instantly, no separate loading state.

Default `staleTime` is `0` — data is "stale" the instant it arrives, so a second mount shows the cached value immediately while potentially firing a quiet background refetch to confirm it's current. That's the "stale-while-revalidate" pattern: not "cached forever," but "never a flash of empty state, and self-correcting."

A key that depends on parameters needs those parameters *inside* the key:

```ts
// src/features/mint-operations/hooks/UseMintOperationsList.ts
useQuery({
  queryKey: ["mint-operations", { page, limit: PAGE_SIZE }],
  queryFn: () => getMintOperations({ page, limit: PAGE_SIZE }),
})
```

Without `page` in the key, switching pages would either not refetch, or two different pages' data would collide under one cache entry.

### 4.3 Mutating, then reacting

```ts
const createMintMutation = useMutation({
  mutationFn: createMintOperation,
  onSuccess: (data) => {
    navigate({ to: "/mint-operation/$id", params: { id: data.id } })
  },
})
```

`onSuccess`'s second parameter, `variables`, is the data originally passed to `.mutate(...)` — useful when the response itself doesn't contain something you need (e.g. register's response has no password, but you might want to immediately log in with the same credentials the user just registered with — that's exactly how this app auto-logs a user in right after registering).

### 4.4 Polling with `refetchInterval`

The mint-operation status page needs to keep checking a record until its status stops being `PENDING`. That's not a `useEffect` + `setInterval` problem — `refetchInterval` can be a function:

```ts
// src/features/mint-operations/hooks/UseMintOperationInfo.ts
useQuery({
  queryKey: ["mint-operation", id],
  queryFn: () => getMintOperation(id),
  refetchInterval: (query) =>
    query.state.data?.status === "PENDING" ? 1000 : false,
})
```

It's evaluated after every fetch (the very first fetch on mount happens regardless, governed by `enabled`, not this option) and returns either a number of milliseconds (schedule another fetch) or `false` (stop). No manual interval to clear, no cleanup to forget — the query stops polling itself the moment the data says it should.

---

## Part 5 — Client State (Zustand)

### 5.1 The store, and why it's this small

```ts
// src/store/auth-store.ts
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    { name: "uyum-auth" },
  ),
);
```

`persist` mirrors the store to `localStorage` automatically and rehydrates it on page load — the app never touches `localStorage` directly, which matters because `persist` wraps the state as a JSON envelope, not the raw value; reading it by hand elsewhere would mean re-implementing that format.

**A worked mistake, and why it matters.** An early version of this store held a nested `sessionInfo: { token, userId, userEmail }` object instead of a flat `token`. Two problems, both instances of the same underlying rule:

- `userId`/`userEmail` are *server data*, fetched once at login and then frozen in a persisted blob — if a user's profile ever changed server-side, this copy would silently go stale with nothing to refresh it. Server-sourced data belongs in TanStack Query's cache (which re-fetches and stays current), not in Zustand.
- The "cleared" state was represented two different ways in two different places (`sessionInfo: null` on init, `{ token: null, userId: null, userEmail: null }` on logout) — an object is truthy even with every field null, so `if (sessionInfo)` would have incorrectly read a freshly-logged-out user as still logged in.

Rule of thumb that comes up constantly in this codebase: a Zustand store should hold only things that exist purely in the browser and were never fetched — and never two different representations of the same fact.

### 5.2 Reading state outside a component: `.getState()`

```ts
// works inside a component or hook:
const token = useAuthStore((state) => state.token)

// works anywhere else — route guards, axios interceptors:
const token = useAuthStore.getState().token
```

`useAuthStore(selector)` is a hook — only callable during a component's render. `.getState()` is a plain, non-reactive read of the current value, available on the store itself, for code that isn't part of React's render cycle at all (2.2, 6.3).

---

## Part 6 — Routing (TanStack Router)

### 6.1 The route tree

```tsx
// src/routes/router.tsx
const rootRoute = createRootRoute({ component: RootLayout })

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginForm,
})

const routeTree = rootRoute.addChildren([loginRoute, /* ... */])
export const router = createRouter({ routeTree })
```

Each `createRoute` call is directly analogous to a `@Get('/login')` handler in a NestJS controller: "when the URL matches this path, this is what renders" — just client-side, matching the browser's address bar instead of an HTTP request.

**Dynamic segments use `$param`, not `:param`.** This is TanStack Router's own syntax, different from the Express/React-Router convention most people assume by default:

```tsx
path: "/mint-operation/$id"
```

### 6.2 Reading params, navigating, and why `to`/`params` beats a hand-built string

```tsx
const { id } = useParams({ from: "/authenticated/mint-operation/$id" })
```

Note the `from` string includes `authenticated` — the *id* of a pathless parent route (6.4) — even though that segment never appears in the real URL. The `from` string is the route's internal identifier in the tree, not literally the URL.

Navigating to a parameterized route:

```tsx
navigate({ to: "/mint-operation/$id", params: { id: data.id } })
```

not `navigate({ to: `/mint-operation/${data.id}` })`. The `params` object exists specifically so TypeScript can verify both that the route actually exists and that you're passing the exact params it needs — a typo in a hand-built string is a runtime 404 nobody notices until a user hits it; a typo here is a compile error.

### 6.3 Route guards with `beforeLoad`

```ts
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  component: AuthenticatedLayout,
  beforeLoad: () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
});
```

`beforeLoad` runs as part of route *matching*, before the destination component is ever created — so an unauthenticated user redirected this way never mounts the protected page at all, not even briefly. That's a meaningfully stronger guarantee than a component-level check (e.g. a hook that redirects in a `useEffect` after the component has already started rendering) — this is exactly why `useAuthStore.getState()`, not the hook, shows up again here: `beforeLoad` isn't part of a component's render.

### 6.4 Layouts via pathless routes + `Outlet`

`authenticatedRoute` above has no `path` — just an `id`. That makes it a *pathless layout route*: it adds nothing to the URL, but every route nested under it (via `.addChildren([...])`) inherits its `beforeLoad` guard and gets wrapped by its `component`:

```tsx
// src/routes/authenticated-layout.tsx
function AuthenticatedLayout() {
  return (
    <>
      <NavBar />
      <div style={{ paddingTop: 64 }}>
        <Outlet />
      </div>
    </>
  )
}
```

`<Outlet />` is where whichever child route actually matched gets rendered — the same mechanism `RootLayout` uses for the whole app, just scoped to one subtree. This is how the nav bar ended up "fixed on every authenticated route" without being duplicated into every page: it's defined once, at the layout level, and every current and future protected route inherits it automatically just by being nested under `authenticatedRoute`.

---

## Part 7 — Architecture

### 7.1 Feature-based folders

```
src/
  features/
    auth/            → login/register forms, hooks, schemas
    mint-operations/  → everything about mint operations
  components/          → genuinely shared, generic UI (NavBar) — not tied to one feature
  clients/              → the API wire contract (axios instance, endpoint functions, payload types)
  store/                 → Zustand stores (client-only state)
  routes/                 → route tree, layouts
```

The rule that decided every "where does this go" question all project: group by *domain*, not by technical role. A `components/` folder holding every component regardless of feature scatters "everything about auth" across unrelated top-level folders; a `features/auth/` folder keeps it self-contained, deletable, and understandable on its own.

Within a feature, the split is by responsibility: `schemas/` (validation), `hooks/` (state + logic), `components/` (rendering only) — mirroring the hexagonal-architecture instinct of keeping business logic independent from the rendering/transport layer around it.

### 7.2 SOLID, loosely mapped

- **Single Responsibility** → the hook/component split (1.6). A component's job is rendering; a hook's job is everything else.
- **Open/Closed** → props. Reusing a component with different data, without editing its internals, is Open/Closed in practice.
- **Interface Segregation** → hooks return only what's needed (`{ form, isLoading, errorMessage, clearError }`), never the whole internal `useMutation`/`useForm` object. A component depending on four specific fields is easier to reason about than one depending on an entire mutation's internals.
- **Dependency Inversion** → components depend on whatever a hook returns, never on *how* that data was fetched. `MintOperationInfo` doesn't know or care that `useMintOperationInfo` uses TanStack Query underneath.

(Liskov doesn't have a clean React equivalent — no inheritance in idiomatic React.)

### 7.3 Styling: three tiers

- **`index.css`** — true global concerns only: reset, page background, base font.
- **A component's CSS Module** (`Component.module.css`, colocated) — layout specific to one component, not shared elsewhere. Vite auto-scopes every class name in a `*.module.css` file so it can never collide with another component's class of the same name; you import it as a JS object (`styles.wrapper`), not a global class string.
- **The design system itself** (`design.md` + antd) — colors, spacing, and component defaults come from the design tokens, not invented hex values or magic pixel numbers. Where a plain CSS file genuinely can't reach a JS-computed token (antd's runtime theme system), the fallback is the *documented* hex value with a comment citing which token it represents — not an arbitrary color that happens to look right.

### 7.4 TypeScript gotchas actually hit in this codebase

- **A function's `.length` is its parameter count, not something about calling it.** `form.getAllErrors.length` (forgetting the `()`) silently evaluates the arity of the function, not the length of an array — always `0` for a zero-argument method, so the resulting condition was always false regardless of real form state.
- **Template literal types aren't inferred from a regex.** `z.string().regex(/^0x[a-fA-F0-9]{40}$/)` still infers as plain `string`; the wire type `` `0x${string}` `` needs an explicit assertion at the point where the two meet, with a comment explaining *why* the assertion is safe (the regex already proved it at runtime).
- **`useForm`'s generic type comes from `defaultValues`**, not from anywhere more "obvious" — omit it, and everything downstream (`value` inside `onSubmit`, `field.state.value`) silently degrades to `unknown`.
- **`&&` returns an operand, not always a boolean.** `!canSubmit && emailValue && passwordValue` can evaluate to `""` (an empty string) instead of `false` — still falsy, but not the boolean you were expecting, and easy to get subtly wrong once more than two conditions are chained.

---

## Capstone: tracing one request through every layer

Submitting the mint-operation form, end to end — every part of this guide, in the order it actually executes:

1. **The form** (`CreateMintForm.tsx`) — TanStack Form (Part 3) has been validating on every keystroke against `createMintSchema` (Zod, 2.1). The submit button is disabled until `form.state.canSubmit` is true, read reactively via `form.Subscribe` (3.3).
2. **Submit** — the native `<form onSubmit>` calls `e.preventDefault()` (stop the browser's own full-page submission) and `form.handleSubmit()`, which runs final validation and calls the `onSubmit` option with the validated `value`.
3. **The hook's `onSubmit`** (`UseCreateMintForm.ts`) — reshapes the form's dollar-denominated `amount` into the wire contract's `amountInCents` (2.3's "form schema vs. wire payload are allowed to differ" point, made concrete), then calls `createMintMutation.mutate(payload)`.
4. **The mutation** (`useMutation`, Part 4) — calls `createMintOperation(payload)` in `clients/core.ts`.
5. **The client function** — `apiClient.post<MintOperationResponse>("/mint-operations", data)`. Before this request leaves the browser, the **request interceptor** (2.2) reads the current token via `useAuthStore.getState()` (5.2) and attaches `Authorization: Bearer <token>`.
6. **The backend** validates the JWT, creates the record in `PENDING` status, and returns it immediately — the actual charge and mint happen asynchronously, after this response.
7. **`onSuccess`** — the mutation's success callback calls `navigate({ to: "/mint-operation/$id", params: { id: data.id } })` (6.2), a typed, guard-checked navigation, not a hand-built URL string.
8. **The route matches** — `beforeLoad` (6.3) re-confirms a token exists (it does, we're already authenticated); `AuthenticatedLayout` (6.4) renders `NavBar` plus this new page via `Outlet`.
9. **The status page** (`MintOperationInfo.tsx`) mounts, and `useMintOperationInfo` fires `useQuery` for this specific operation, keyed by its id (4.2).
10. **Polling** — `refetchInterval` (4.4) re-checks every second while `status === "PENDING"`, and stops itself automatically the moment the backend reports `COMPLETED` or `FAILED` — no manual interval, no cleanup, no `useEffect`.

Every layer in that trace is something covered above, and every line of code behind it is real, current code in this repository.
