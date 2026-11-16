# Republik — Engineering Guidelines & Agent Rules (`AGENTS.md`)

This document defines the strict engineering standards, architectural patterns, and code conventions for all agents and developers working across the **Republik** repository.

---

## 1. Core Principles & Philosophy

1. **Zero `any` Tolerance**: Code must be strictly typed. Avoid `any`, `as any`, `@ts-ignore`, and unchecked type assertions.
2. **SOLID & Clean Code**: Every class, function, hook, and module must have a single responsibility, clean abstractions, and high cohesion.
3. **No Inline Styles**: Never use inline `style={{ ... }}` in JSX/TSX. All styling must leverage utility-first classes (Tailwind CSS v4) or semantic design tokens.
4. **Constants Over Plain Text**: Plain text, magic strings, and UI copy must be extracted into strongly-typed `as const` constants.
5. **Frontend MVVM Pattern**: The frontend must strictly separate presentation (View), presentation logic/state (ViewModel via Custom Hooks), and domain data/schemas (Model).

---

## 2. Strict Type Safety (No `any`)

- **Banned**: `any`, `as any`, `Record<string, any>`, `@ts-ignore`, `@ts-nocheck`.
- **Use `unknown` for Dynamic Data**: When the type is not initially known, use `unknown` and narrow it using TypeScript type guards, assertion functions, or schema validators.
- **Runtime Schema Validation at Boundaries**:
  - All external data entering the application (API responses, route params, search queries, user forms) must be validated using a schema library (e.g. Zod or Standard Schema).
  - Infer static types directly from the schema (`z.infer<typeof MySchema>`) rather than declaring loose types and casting.
- **Exhaustive Type Checking**: Use discriminated unions with exhaustive `switch` / pattern matching. Ensure that unexpected branches trigger compiler errors (e.g. using an `assertNever(val: never)` helper).
- **Generics**: Parameterize reusable functions and data structures with constrained generics (`<T extends BaseEntity>`) rather than losing type specificity.

---

## 3. Clean Code & SOLID Principles

### Single Responsibility Principle (SRP)
- **Frontend**: A React component renders UI and captures user gestures—nothing more. It does not fetch data directly or manage complex multi-step state. That belongs to the ViewModel.
- **Backend**: NestJS controllers only route requests and map DTOs. Services execute domain/business logic. Repositories/adapters handle data persistence.

### Open/Closed Principle (OCP)
- Build components and services open for extension via composition, dependency injection, and props, but closed for modification. Avoid sprawling `if/else` ladders for variants.

### Liskov Substitution Principle (LSP)
- Derived types, mock implementations, and service adapters must fulfill the full contract of their parent interfaces without unexpected side-effects or unsupported methods.

### Interface Segregation Principle (ISP)
- Favor small, focused interfaces over large, monolithic ones.
- Components should only accept the specific props they consume rather than entire domain objects when only one or two fields are needed.

### Dependency Inversion Principle (DIP)
- Depend on abstractions (interfaces / ports), not concrete implementations.
- **Backend**: Inject services, repositories, and third-party clients using NestJS Dependency Injection.
- **Frontend**: Pass dependencies (e.g., API services, storage handlers) into custom hooks or provide them via React Context when mocking or swappability is required.

---

## 4. Constants Over Plain Text (No Magic Strings)

Hardcoded plain text strings in JSX or logic create fragility, impede localization, and make maintenance error-prone.

### Rules:
1. **No Magic Strings in JSX or Logic**:
   - Bad: `<button>Submit Form</button>`
   - Bad: `if (status === 'in_progress')`
   - Good: `<button>{AUTH_CONSTANTS.LABELS.SUBMIT}</button>`
   - Good: `if (status === TASK_STATUS.IN_PROGRESS)`
2. **Collocated Feature Constants**:
   - Each feature module must include a `*.constants.ts` file containing its UI labels, placeholders, aria-labels, error messages, and domain keys.
   - Always declare them with `as const` to preserve literal types.
3. **Global Constants**:
   - Universal values (e.g., application routes, environment flags, HTTP header names, default pagination limits) reside in `@/constants` (or `src/constants/`).

```typescript
// Example: src/features/auth/auth.constants.ts
export const AUTH_TEXT = {
  TITLE: "Sign in to Republik",
  EMAIL_LABEL: "Email Address",
  PASSWORD_LABEL: "Password",
  SUBMIT_BUTTON: "Sign In",
  FORGOT_PASSWORD_LINK: "Forgot your password?",
  ERRORS: {
    INVALID_EMAIL: "Please provide a valid email address.",
    REQUIRED_FIELD: "This field is required.",
  },
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  RESET_PASSWORD: "/auth/reset-password",
} as const;
```

---

## 5. Styling Guidelines (No Inline Styles)

The frontend uses **Tailwind CSS v4**.

### Rules:
1. **Absolute Ban on `style={{ ... }}`**:
   - Never write inline styles for margins, colors, layout, fonts, or positioning.
   - Use Tailwind utility classes directly in the `className` attribute.
2. **Conditional & Dynamic Classes**:
   - Manage conditional class names with utility helpers like `clsx` or `cn()`.
   - Map variant states to explicit class dictionaries rather than string concatenation.
3. **Dynamic Runtime Values**:
   - In rare cases where a runtime value cannot be represented by Tailwind classes (e.g., dynamic coordinates, canvas dimensions, or custom progress bar percentages), bind them via CSS custom properties (variables) or Tailwind arbitrary values:
     ```tsx
     // Allowed only for pure runtime math:
     <div className="h-2 bg-blue-500 transition-all" style={{ width: `${progressPercentage}%` }} />
     ```
     Never use inline styles for static properties like colors, paddings, or font sizes.

---

## 6. Frontend Architecture: MVVM Pattern (Next.js 16 + React 19)

In `republik-frontend`, every non-trivial UI feature follows the **Model-View-ViewModel (MVVM)** pattern using React custom hooks.

```
src/
└── features/
    └── user-profile/
        ├── models/
        │   ├── user.model.ts          # Schemas, interfaces, domain entities
        │   └── user.dto.ts            # API request/response shapes
        ├── view-models/
        │   ├── use-user-profile.vm.ts # Presentation state, actions, side effects
        │   └── __tests__/
        │       └── use-user-profile.vm.spec.ts # Isolated VM unit tests
        ├── views/
        │   ├── user-profile-card.tsx  # Pure presentational component
        │   └── user-profile-form.tsx  # Pure presentational component
        ├── user-profile.constants.ts  # Text constants, UI copy, magic values
        └── index.ts                   # Public API of the feature
```

### 1. Model (`*.model.ts`)
- Defines domain types, data structures, and Zod/Standard Schema definitions.
- Contains domain-level transformation helpers (e.g., `formatUserFullName(user: User)`).

### 2. ViewModel (`use<Feature>ViewModel.ts`)
- Implemented as a custom React Hook.
- **Responsibilities**:
  - Holds and coordinates local state (e.g., `useState`, `useReducer`, or external client cache).
  - Handles asynchronous operations (calling API services, error catching).
  - Exposes derived/computed values and formatters.
  - Exposes explicit action handlers for the View.
- **Signature Contract**: Must return an object structured clearly with `state`, `actions`, and optional `computed`:
  ```typescript
  export interface UserProfileViewModel {
    state: {
      readonly user: User | null;
      readonly isLoading: boolean;
      readonly error: string | null;
    };
    actions: {
      updateDisplayName: (name: string) => Promise<void>;
      retry: () => void;
    };
  }
  ```

### 3. View (`*.tsx`)
- Declarative React components (Server Components or Client Components).
- **Responsibilities**:
  - Consumes `{ state, actions }` from the ViewModel hook (or as props passed down from a parent).
  - Renders markup styled with Tailwind classes.
  - References labels and messages from collocated `*.constants.ts`.
  - Zero raw fetch calls, zero complex business mutations inside the JSX.

---

## 7. Backend Architecture (NestJS 12 ESM)

In `republik-backend`, follow clean modular architecture and NestJS best practices:

1. **ESM Compliance**:
   - Imports must include explicit `.js` extensions for relative paths.
   - Use `import.meta.dirname` instead of `__dirname`.
2. **Schema Validation**:
   - Use `StandardSchemaValidationPipe` with Zod/Standard Schema for request validation (`@Body({ schema })`, `@Param('id', { schema })`).
3. **Observability**:
   - Traces, errors, and metrics report to **NestJS Observe** via `ObserveModule`.
4. **Dependency Injection**:
   - Encapsulate business logic into Injectable Services. Controllers must remain thin orchestrators.

---

## 8. Testing Standards

1. **ViewModel Unit Tests**:
   - Test custom hook ViewModels in isolation using `@testing-library/react` (`renderHook`).
   - Verify state transitions, error handling, loading states, and action dispatching without needing full DOM trees.
2. **Presentational Component Tests**:
   - Test Views for accessibility (ARIA roles, keyboard navigation) and conditional rendering of states passed via props.
3. **Backend Tests**:
   - Unit tests run with **Vitest** (`vi.fn()`, not `jest.fn()`).
   - Controller & Service tests must mock external repositories and HTTP clients.
   - End-to-end tests run via `npm run test:e2e` with Supertest and Vitest.

---

## 9. Tooling & Enforcement

- **Frontend**:
  - Linter & Formatter: **Biome** (`npm run lint`, `npm run format`).
  - Keep Biome checks passing cleanly on every change.
- **Backend**:
  - Linter: **Oxlint** (`npm run lint`).
  - Formatter: **Prettier** (`npm run format`).
  - Test Runner: **Vitest** (`npm run test`).

