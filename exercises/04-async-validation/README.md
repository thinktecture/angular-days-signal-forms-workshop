# Exercise 04 – Async Validation & Debouncing

## Goals

Server-side checks are rules like any other. Signal Forms runs them only after all synchronous rules of a field
pass, exposes the state as `pending()` and lets you throttle the request.

You will:

- Validate a field against an HTTP endpoint with `validateHttp()` and the `debounce` option
- Validate with any `Resource` via `validateAsync()` and `rxResource()`
- Show the pending state in the template
- Make the submission wait for pending validators (`ignoreValidators: 'none'`)

## Prerequisites

- Completion of Exercise 03
- Basic understanding of `httpResource()` / `rxResource()`

## Setup

1. Navigate to `http://localhost:4200/async-validation`
2. Open `src/app/components/async-validation/`
3. Compare with the running solution at `http://localhost:4200/solutions/async-validation`

The "backend" is faked by `mock-api.interceptor.ts` (registered in `app.config.ts`). It answers:

| Request                             | Response                                | Delay |
| ----------------------------------- | --------------------------------------- | ----- |
| `GET /api/users/check?username=...` | `{ available: boolean }`                | 800ms |
| `GET /api/emails/check?email=...`   | `{ available: boolean }`                | 600ms |
| `GET /api/promo/validate?code=...`  | `{ valid: boolean; discount?: number }` | 500ms |

Test values:

- Taken usernames: `taken`, `admin`, `user`, `test`, `demo`
- Registered emails: `test@example.com`, `admin@example.com`, `user@example.com`
- Valid promo codes: `SAVE10`, `SAVE20`, `WELCOME`, `VIP50`

## The Starting Point

A Signal Form with synchronous rules and a submission. The `TODO` comments mark where the async rules go.

<details>
<summary>How this looked with Reactive Forms</summary>

```typescript
function usernameAvailabilityValidator(userService: MockUserService): AsyncValidatorFn {
  return (control) =>
    timer(300).pipe(
      switchMap(() => userService.checkUsernameAvailability(control.value)),
      map((isAvailable) => (isAvailable ? null : { usernameTaken: true })),
      catchError(() => of({ serverError: true })),
    );
}

// + statusChanges subscriptions to track PENDING/VALID/INVALID for the UI
```

</details>

## Tasks

### Task 1: Username Availability with validateHttp()

<details>
<summary>Show Solution</summary>

```typescript
import { validateHttp } from '@angular/forms/signals';

validateHttp(path.username, {
  // Throttle only the request. The sync rules above still react on every keystroke.
  debounce: 300,
  // Returning undefined skips the request
  request: ({ value }) =>
    value() ? `/api/users/check?username=${encodeURIComponent(value())}` : undefined,
  onSuccess: (res: { available: boolean }) =>
    res.available ? null : { kind: 'usernameTaken', message: 'This username is already taken' },
  onError: () => ({ kind: 'serverError', message: 'Could not check username availability' }),
});
```

`request` can also return an `HttpResourceRequest` (`{ url, params, method, ... }`).

</details>

### Task 2: Email Registration Check

<details>
<summary>Show Solution</summary>

```typescript
validateHttp(path.email, {
  debounce: 300,
  request: ({ value }) =>
    value() ? `/api/emails/check?email=${encodeURIComponent(value())}` : undefined,
  onSuccess: (res: { available: boolean }) =>
    res.available ? null : { kind: 'emailTaken', message: 'This email is already registered' },
  onError: () => ({ kind: 'serverError', message: 'Could not check email availability' }),
});
```

</details>

### Task 3 (Bonus): Promo Code with validateAsync() and rxResource()

`validateAsync()` works with any `Resource`. Here the service returns an `Observable`, so `rxResource()` fits.

<details>
<summary>Show Solution</summary>

```typescript
import { rxResource } from '@angular/core/rxjs-interop';
import { validateAsync } from '@angular/forms/signals';

validateAsync(path.promoCode, {
  debounce: 300,
  // What the resource depends on. undefined = nothing to validate.
  params: ({ value }) => value() || undefined,
  // Build the resource from the params signal
  factory: (code) =>
    rxResource({
      params: code,
      stream: ({ params }) => this.userService.validatePromoCode(params),
    }),
  onSuccess: (result) =>
    result?.valid === false ? { kind: 'invalidPromo', message: 'Invalid promo code' } : null,
  onError: () => ({ kind: 'serverError', message: 'Could not validate promo code' }),
});
```

</details>

### Task 4: Submission Waits for Pending Validators

By default (`'pending'`) a submission goes through while async validators are still running.

<details>
<summary>Show Solution</summary>

```typescript
submission: {
  ignoreValidators: 'none', // 'pending' (default) | 'none' | 'all'
  action: async (field) => { ... },
}
```

</details>

### Task 5: Pending State in the Template

<details>
<summary>Show Solution</summary>

```html
<input matInput [formField]="profileForm.username" />
<mat-hint>
  @if (profileForm.username().pending()) {
  <mat-spinner diameter="14" />
  Checking availability... } @else if (profileForm.username().valid()) { ✓ Available }
</mat-hint>

<button type="submit" [disabled]="profileForm().submitting()">
  @if (profileForm().pending()) { Validating... } @else { Save Profile }
</button>
```

</details>

## Completion Criteria

- [ ] Username and email are checked on the server with `validateHttp()`
- [ ] Requests are debounced, sync errors still appear immediately
- [ ] `pending()` is visible per field and on the form
- [ ] Submission does not run while validators are pending
- [ ] (Bonus) Promo code uses `validateAsync()` + `rxResource()`

<details>
<summary>Async Validation Cheat Sheet</summary>

| Reactive Forms                     | Signal Forms                                          |
| ---------------------------------- | ----------------------------------------------------- |
| `AsyncValidatorFn` + HTTP call     | `validateHttp(path, { request, onSuccess, onError })` |
| `AsyncValidatorFn` + Observable    | `validateAsync(path, { params, factory, onSuccess })` |
| `timer(300).pipe(switchMap(...))`  | `debounce: 300` option                                |
| `control.pending`                  | `field().pending()`                                   |
| `statusChanges` subscription       | not needed, `pending()` / `valid()` are signals       |
| `{ asyncValidators: [...] }` order | async rules run only after sync rules pass            |
| manual re-check                    | `field().reloadValidation()`                          |

**States while a request is running:** `pending() === true`, `valid() === false`, `invalid() === false`.

**Debouncing the whole field** (model update, all rules) instead of only the request:

```typescript
debounce(path.search, 300); // milliseconds
debounce(path.username, 'blur'); // commit on blur
```

</details>

<details>
<summary>Solution Files</summary>

- `exercises/04-async-validation/solution/async-validation.component.ts`
- `exercises/04-async-validation/solution/async-validation.component.html`
- Running: `http://localhost:4200/solutions/async-validation`

</details>
