# Exercise 04 – Async Validation & Debouncing

## Goals

In this exercise, you will learn how to implement asynchronous validation with proper debouncing in Signal Forms.

You will:

- Create async validators that call external services
- Implement debouncing to prevent excessive API calls
- Handle loading states during async validation
- Display real-time feedback for async validation status

## Prerequisites

- Completion of Exercise 03 (Conditional Validation)
- Understanding of Promises/async-await or Observables
- Basic understanding of debouncing

## Setup

1. Start the dev server: `npm run start`
2. Navigate to `http://localhost:4200/async-validation`
3. Open the component at `src/app/components/async-validation/`

## The Starting Point

The existing Reactive Form demonstrates async validation using:

- `AsyncValidatorFn` returning `Observable<ValidationErrors | null>`
- RxJS `timer()` for debouncing
- Manual status tracking with signals
- `statusChanges` subscription for UI feedback

**Pain points with Reactive Forms:**

- Complex RxJS chains for debouncing
- Manual subscription management
- Separate status tracking logic
- Boilerplate for each async validator

## Async Validation Scenarios

This form includes:

| Field | Async Validation | Debounce |
|-------|------------------|----------|
| `username` | Check availability against "server" | 300ms |
| `email` | Check if already registered | 300ms |
| `promoCode` | Validate code and get discount | 300ms |
| `bio` | Character/word count (computed) | Instant |

**Test Values:**

- Taken usernames: `taken`, `admin`, `user`, `test`, `demo`
- Taken emails: `test@example.com`, `admin@example.com`, `user@example.com`
- Valid promo codes: `SAVE10`, `SAVE20`, `WELCOME`, `VIP50`

## Tasks

### Task 1: Update Imports

Replace Reactive Forms with Signal Forms imports.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AsyncValidatorFn,
} from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// AFTER
import {
  FormField,
  form,
  required,
  email,
  minLength,
  maxLength,
  pattern,
  asyncValidator,
} from '@angular/forms/signals';
```

</details>

### Task 2: Create Model Signal

Replace FormBuilder with a signal-based model.

<details>
<summary>Show Solution</summary>

```typescript
formModel = signal<UserProfileModel>({
  username: '',
  email: '',
  promoCode: '',
  displayName: '',
  bio: '',
});
```

</details>

### Task 3: Implement Async Validator with Debouncing

Create an async validator with built-in debouncing.

<details>
<summary>Show Solution</summary>

```typescript
profileForm = form(this.formModel, (schema) => {
  // Sync validators
  required(schema.username);
  minLength(schema.username, 3);
  pattern(schema.username, /^[a-zA-Z0-9_]+$/);

  // Async validator with debouncing
  asyncValidator(
    schema.username,
    async (value) => {
      // Skip if value is too short (sync validators will catch this)
      if (!value || value.length < 3) return null;

      // Call the API
      const isAvailable = await this.checkUsernameAvailability(value);

      return isAvailable
        ? null
        : { message: 'This username is already taken' };
    },
    {
      debounce: 300, // Wait 300ms after user stops typing
    }
  );

  // Email validation
  required(schema.email);
  email(schema.email);

  asyncValidator(
    schema.email,
    async (value) => {
      if (!value || !value.includes('@')) return null;

      const isAvailable = await this.checkEmailAvailability(value);

      return isAvailable
        ? null
        : { message: 'This email is already registered' };
    },
    {
      debounce: 300,
    }
  );

  // Promo code (optional but validated if provided)
  asyncValidator(
    schema.promoCode,
    async (value) => {
      if (!value) return null;

      const result = await this.validatePromoCode(value);

      if (result.valid) {
        // Store the discount for UI display
        this.promoDiscount.set(result.discount);
        return null;
      }

      this.promoDiscount.set(null);
      return { message: 'Invalid promo code' };
    },
    {
      debounce: 300,
    }
  );

  // Display name (sync only)
  required(schema.displayName);
  minLength(schema.displayName, 2);
  maxLength(schema.displayName, 50);

  // Bio (sync only)
  maxLength(schema.bio, 500);
});
```

</details>

### Task 4: Create Service Methods

Implement the async service methods (simulating API calls).

<details>
<summary>Show Solution</summary>

```typescript
// Simulate API call to check username availability
private async checkUsernameAvailability(username: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const takenUsernames = ['taken', 'admin', 'user', 'test', 'demo'];
  return !takenUsernames.includes(username.toLowerCase());
}

// Simulate API call to check email availability
private async checkEmailAvailability(email: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const registeredEmails = ['test@example.com', 'admin@example.com', 'user@example.com'];
  return !registeredEmails.includes(email.toLowerCase());
}

// Simulate API call to validate promo code
private async validatePromoCode(code: string): Promise<{ valid: boolean; discount?: number }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const validCodes: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    WELCOME: 15,
    VIP50: 50,
  };

  const discount = validCodes[code.toUpperCase()];
  return discount ? { valid: true, discount } : { valid: false };
}
```

</details>

### Task 5: Handle Validation Status in UI

Display loading indicators and validation results.

<details>
<summary>Show Solution</summary>

```html
<!-- Username field with status indicator -->
<div class="form-field">
  <label for="username">Username *</label>
  <div class="input-with-status">
    <input [formField]="profileForm.username" />

    <span class="status-indicator">
      @if (profileForm.username().validating()) {
        <span class="spinner"></span>
        <span>Checking...</span>
      } @else if (profileForm.username().valid() && formModel().username) {
        <span class="status-icon available">✓</span>
        <span>Available</span>
      } @else if (profileForm.username().hasError('usernameTaken')) {
        <span class="status-icon taken">✗</span>
        <span>Taken</span>
      }
    </span>
  </div>

  @if (profileForm.username().invalid() && profileForm.username().touched() && !profileForm.username().validating()) {
    @for (error of profileForm.username().errors(); track error.message) {
      <span class="error">{{ error.message }}</span>
    }
  }
</div>
```

</details>

### Task 6: Use `validating()` Signal

Access the built-in validation status signals.

<details>
<summary>Show Solution</summary>

```typescript
// Signal Forms provides these signals automatically:
profileForm.username().validating()  // true while async validator is running
profileForm.username().valid()       // true when all validators pass
profileForm.username().invalid()     // true when any validator fails
profileForm.username().errors()      // array of error objects

// Form-level status
profileForm().validating()           // true if any field is validating
profileForm().valid()                // true if all fields are valid
profileForm().submitting()           // true during submit()

// Example: Disable submit button while validating
<button
  type="submit"
  [disabled]="profileForm().invalid() || profileForm().validating()"
>
  @if (profileForm().validating()) {
    Validating...
  } @else {
    Save Profile
  }
</button>
```

</details>

### Task 7: Implement Computed Values with Effects

Use effects for debounced computed values (like character count).

<details>
<summary>Show Solution</summary>

```typescript
// Character and word count using computed signals
bioCharCount = computed(() => this.formModel().bio?.length ?? 0);
bioWordCount = computed(() => {
  const bio = this.formModel().bio;
  return bio ? bio.trim().split(/\s+/).filter(Boolean).length : 0;
});

// Template
<textarea [formField]="profileForm.bio"></textarea>
<div class="char-count" [class.warning]="bioCharCount() > 450">
  {{ bioCharCount() }} / 500 characters
  <span class="word-count">({{ bioWordCount() }} words)</span>
</div>
```

</details>

### Task 8: Update Submit Handler

Use the `submit()` function with async validation.

<details>
<summary>Show Solution</summary>

```typescript
async onSubmit(): Promise<void> {
  await submit(this.profileForm, async (form) => {
    try {
      // submit() waits for all async validators to complete
      // before calling this callback

      const data = form().value();
      console.log('Profile saved:', data);

      this.submitted.set(true);
      this.submittedData.set({ ...data });

      return null; // Success
    } catch (error) {
      return {
        kind: 'processing_error' as const,
        error: String(error),
      };
    }
  });
}
```

</details>

## Completion Criteria

- [ ] All async validators use `asyncValidator()` with `debounce` option
- [ ] No manual RxJS `timer()` or `debounceTime()` for debouncing
- [ ] No manual `statusChanges` subscriptions
- [ ] Loading states show during async validation (`validating()`)
- [ ] Submit button disabled while validating
- [ ] Error messages display correctly after validation completes
- [ ] Form cannot submit while async validation is pending

<details>
<summary>Async Validation Cheat Sheet</summary>

| Reactive Forms | Signal Forms |
|----------------|--------------|
| `AsyncValidatorFn` | `asyncValidator()` function |
| `timer().pipe(switchMap(...))` | `{ debounce: 300 }` option |
| `control.statusChanges` | `field().validating()` signal |
| `control.pending` | `field().validating()` |
| Manual subscription cleanup | Automatic |
| `Observable<ValidationErrors>` | `Promise<Error \| null>` |

**`asyncValidator` Signature:**

```typescript
asyncValidator(
  schemaPath,           // The field to validate
  validatorFn,          // async (value) => Error | null
  options?: {
    debounce?: number,  // Milliseconds to wait (default: 0)
    message?: string,   // Optional error message
  }
);

// Error return format
{ message: 'Error message to display' }
// or null for valid
```

**Status Signals:**

```typescript
field().validating()   // Async validation in progress
field().valid()        // All validators pass
field().invalid()      // Any validator fails
field().pending()      // Alias for validating()
field().errors()       // Array of { message: string }

form().validating()    // Any field is validating
form().valid()         // All fields valid
```

</details>

<details>
<summary>Key Benefits</summary>

### 1. Built-in Debouncing

No need for RxJS `timer()` or `debounceTime()` - just pass `{ debounce: ms }`.

### 2. Simpler Async Pattern

Return a Promise instead of Observable - easier to write and understand.

### 3. Automatic Status Tracking

`validating()` signal updates automatically - no manual subscriptions.

### 4. Clean Error Format

Return `{ message: string }` or `null` - consistent with sync validators.

### 5. Submit Integration

`submit()` automatically waits for async validators before proceeding.

</details>

<details>
<summary>Debouncing Best Practices</summary>

### When to Debounce

- **API calls**: Always debounce to prevent rate limiting (200-500ms)
- **Database queries**: Debounce to reduce load (300-500ms)
- **Expensive computations**: Debounce if > 100ms (100-200ms)

### When NOT to Debounce

- **Instant feedback needed**: Format validation, character count
- **After blur events**: User has finished typing
- **Submit validation**: Should run immediately

### Recommended Debounce Times

| Use Case | Debounce |
|----------|----------|
| Username/email availability | 300-500ms |
| Search suggestions | 200-300ms |
| Database lookups | 300-500ms |
| Complex calculations | 100-200ms |

</details>

<details>
<summary>Solution Files</summary>

See the complete solution in:

- `signal-forms-workshop/exercises/04-async-validation/solution/`

</details>
