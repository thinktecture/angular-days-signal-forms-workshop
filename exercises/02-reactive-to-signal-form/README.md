# Exercise 02 – Reactive Form to Signal Forms

## Goals

In this exercise, you will learn how to migrate a complex Angular Reactive Form to the new Signal Forms API.

You will:

- Understand how FormGroup maps to Signal Forms
- Convert nested FormGroups to nested signal objects
- Migrate FormArrays to signal-based arrays
- Use computed signals for complex validation (password strength, cross-field)
- Replace form validation patterns with Signal Forms equivalents

## Prerequisites

- Understanding of Angular Reactive Forms (FormGroup, FormControl, FormArray)
- Completion of Exercise 01
- Familiarity with custom validators

## Setup

1. Start the dev server: `npm run start`
2. Navigate to `http://localhost:4200/reactive-form`
3. Open the component at `src/app/components/reactive-form/`

## The Starting Point

The existing Reactive Form includes:

- **FormBuilder** with FormGroup and FormArray
- **Nested FormGroup** for address data
- **FormArray** for dynamic phone numbers (add/remove)
- **Custom validator** for password strength
- **Cross-field validator** for password confirmation
- Standard validators (required, email, pattern, minLength)

## Tasks

### Task 1: Update Imports

Replace the Reactive Forms imports with Signal Forms.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

// AFTER
import { signal, computed } from '@angular/core';
import {
  FormField,
  form,
  submit,
  required,
  email,
  minLength,
  pattern,
} from '@angular/forms/signals';
```

</details>

### Task 2: Create the Model Signal

Replace the FormBuilder-based form with a signal-based model.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
registrationForm: FormGroup = this.fb.group({
  firstName: ['', [Validators.required, Validators.minLength(2)]],
  lastName: ['', [Validators.required, Validators.minLength(2)]],
  // ... more fields
});

// AFTER
formModel = signal<RegistrationFormModel>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: '',
  },
  phoneNumbers: [{ type: 'mobile', number: '' }],
  acceptTerms: false,
});
```

</details>

### Task 3: Create the Form with Validation Schema

Use the `form()` function with built-in validators. For complex validation, use `pattern()` or computed signals.

<details>
<summary>Show Solution</summary>

```typescript
// Create the form with validation schema
registrationForm = form(this.formModel, (schema) => {
  // Personal Info
  required(schema.firstName, { message: 'First name is required' });
  minLength(schema.firstName, 2, { message: 'First name must be at least 2 characters' });

  required(schema.lastName, { message: 'Last name is required' });
  minLength(schema.lastName, 2, { message: 'Last name must be at least 2 characters' });

  required(schema.email, { message: 'Email is required' });
  email(schema.email, { message: 'Please enter a valid email address' });

  // Password - use pattern for strength validation
  required(schema.password, { message: 'Password is required' });
  minLength(schema.password, 8, { message: 'Password must be at least 8 characters' });
  pattern(schema.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  });

  required(schema.confirmPassword, { message: 'Please confirm your password' });

  // Nested Address
  required(schema.address.street, { message: 'Street is required' });
  required(schema.address.city, { message: 'City is required' });
  required(schema.address.postalCode, { message: 'Postal code is required' });
  pattern(schema.address.postalCode, /^\d{5}$/, { message: 'Postal code must be 5 digits' });
  required(schema.address.country, { message: 'Country is required' });
});
```

</details>

### Task 4: Implement Cross-Field Validation with Computed Signals

For validation that compares multiple fields (like password confirmation), use computed signals.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE (Reactive Forms group validator)
this.fb.group(
  { password: [...], confirmPassword: [...] },
  { validators: [passwordMatchValidator] }
);

// AFTER (Computed signal for cross-field validation)
passwordsMatch = computed(() => {
  const model = this.formModel();
  if (!model.password || !model.confirmPassword) return true;
  return model.password === model.confirmPassword;
});

// Password strength feedback (computed signal)
passwordStrength = computed(() => {
  const password = this.formModel().password;
  if (!password) return { valid: true, errors: [] as string[] };

  const errors: string[] = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('one number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('one special character');

  return { valid: errors.length === 0, errors };
});

// Terms acceptance
termsAccepted = computed(() => this.formModel().acceptTerms === true);

// Overall form validity
isFormValid = computed(() =>
  this.registrationForm().valid() && this.passwordsMatch() && this.termsAccepted()
);
```

**Template:**

```html
<!-- Cross-field validation display -->
@if (!passwordsMatch() && registrationForm.confirmPassword().touched()) {
  <span class="error">Passwords do not match</span>
}

<!-- Password strength feedback -->
@if (formModel().password && !passwordStrength().valid) {
  <div class="password-hint">
    Password must contain: {{ passwordStrength().errors.join(', ') }}
  </div>
}
```

</details>

### Task 5: Handle Nested Objects

Convert nested FormGroup to nested signal object validation.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE (nested FormGroup)
address: this.fb.group({
  street: ['', [Validators.required]],
  city: ['', [Validators.required]],
  postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
  country: ['', [Validators.required]],
})

// AFTER (Signal Forms nested object)
// Access nested properties directly in the schema
registrationForm = form(this.formModel, (schema) => {
  required(schema.address.street, { message: 'Street is required' });
  required(schema.address.city, { message: 'City is required' });
  required(schema.address.postalCode, { message: 'Postal code is required' });
  pattern(schema.address.postalCode, /^\d{5}$/, { message: 'Postal code must be 5 digits' });
  required(schema.address.country, { message: 'Country is required' });
});
```

**Template Changes:**

```html
<!-- BEFORE -->
<fieldset formGroupName="address">
  <input formControlName="street" />
</fieldset>

<!-- AFTER -->
<fieldset>
  <input [formField]="registrationForm.address.street" />
</fieldset>
```

</details>

### Task 6: Migrate FormArray

Convert FormArray to signal-based array handling.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE (FormArray with push/removeAt)
get phoneNumbers(): FormArray {
  return this.registrationForm.get('phoneNumbers') as FormArray;
}

addPhoneNumber(): void {
  this.phoneNumbers.push(this.createPhoneNumberGroup());
}

removePhoneNumber(index: number): void {
  this.phoneNumbers.removeAt(index);
}

// AFTER (Signal-based array)
addPhoneNumber(): void {
  this.formModel.update((model) => ({
    ...model,
    phoneNumbers: [...model.phoneNumbers, { type: 'mobile', number: '' }],
  }));
}

removePhoneNumber(index: number): void {
  this.formModel.update((model) => ({
    ...model,
    phoneNumbers: model.phoneNumbers.filter((_, i) => i !== index),
  }));
}
```

**Template Changes:**

```html
<!-- BEFORE -->
@for (phone of phoneNumbers.controls; track $index; let i = $index) {
  <div [formGroupName]="'phoneNumbers'">
    <div [formGroupName]="i">
      <select formControlName="type">...</select>
      <input formControlName="number" />
    </div>
  </div>
}

<!-- AFTER -->
@for (phone of formModel().phoneNumbers; track $index; let i = $index) {
  <div>
    <select [formField]="registrationForm.phoneNumbers[i].type">...</select>
    <input [formField]="registrationForm.phoneNumbers[i].number" />
  </div>
}
```

</details>

### Task 7: Update Error Display

Update error display to use Signal Forms patterns.

<details>
<summary>Show Solution</summary>

```html
<!-- BEFORE -->
@if (hasError('firstName')) {
  <span class="error">{{ getErrorMessage('firstName') }}</span>
}

<!-- AFTER -->
@if (registrationForm.firstName().invalid() && registrationForm.firstName().touched()) {
  @for (error of registrationForm.firstName().errors(); track error.message) {
    <span class="error">{{ error.message }}</span>
  }
}
```

</details>

### Task 8: Update Form Submission

Update submit handler to use Signal Forms patterns.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
onSubmit(): void {
  if (this.registrationForm.valid) {
    this.submittedData = this.registrationForm.value as RegistrationFormModel;
  } else {
    this.registrationForm.markAllAsTouched();
  }
}

// AFTER (using submit function)
async onSubmit(): Promise<void> {
  // Check computed validations first
  if (!this.passwordsMatch() || !this.termsAccepted()) {
    return;
  }

  await submit(this.registrationForm, async (form) => {
    try {
      this.submitted.set(true);
      this.submittedData.set({ ...this.formModel() });
      return null;
    } catch (error) {
      return { kind: 'processing_error' as const, error: String(error) };
    }
  });
}
```

</details>

## Completion Criteria

- [ ] `ReactiveFormsModule` replaced with Signal Forms imports
- [ ] Model is a `signal<RegistrationFormModel>`
- [ ] Password strength validation using `pattern()` + computed signal for feedback
- [ ] Cross-field password match validation with computed signal
- [ ] Nested address object validates correctly
- [ ] Phone number array supports add/remove with `signal.update()`
- [ ] All `formControlName` replaced with `[formField]`
- [ ] Error messages display using `field().errors()`
- [ ] Form state uses `form().valid()`, `form().dirty()`, etc.

<details>
<summary>Migration Cheat Sheet</summary>

| Reactive Forms | Signal Forms |
|----------------|--------------|
| `ReactiveFormsModule` | `FormField` |
| `FormBuilder` | `form()` function + `signal()` |
| `FormGroup` | Plain signal object |
| `FormArray` | Array in signal + `update()` |
| `formControlName="x"` | `[formField]="form.x"` |
| `formGroupName="x"` | Direct access: `form.x.child` |
| `[formGroupName]="i"` (array) | `form.array[i].field` |
| `Validators.required` | `required(schema.field, { message })` |
| `Validators.email` | `email(schema.field, { message })` |
| `Validators.minLength(n)` | `minLength(schema.field, n, { message })` |
| `Validators.pattern(r)` | `pattern(schema.field, r, { message })` |
| `Validators.min(n)` | `min(schema.field, n, { message })` |
| `Validators.max(n)` | `max(schema.field, n, { message })` |
| Custom validator | `computed()` signal |
| Group validator | `computed()` comparing fields |
| `Validators.requiredTrue` | `computed(() => value === true)` |
| `formArray.push()` | `signal.update()` with spread |
| `formArray.removeAt(i)` | `signal.update()` with filter |
| `control.errors['key']` | `form.field().errors()` |
| `form.valid` | `form().valid()` |
| `form.markAllAsTouched()` | `submit()` handles this |

</details>

<details>
<summary>Key Differences</summary>

### 1. No More FormBuilder

Signal Forms use plain TypeScript objects in signals instead of FormBuilder.

### 2. Validation Schema

Built-in validators (`required`, `email`, `minLength`, `pattern`) are defined declaratively in the `form()` function's schema callback.

### 3. Complex Validation with Computed Signals

For validation logic not covered by built-in validators (custom rules, cross-field comparisons), use `computed()` signals. This keeps the logic reactive and separate from the form schema.

### 4. Array Handling

Instead of `FormArray.push()` and `removeAt()`, you update the signal directly using `signal.update()`.

### 5. Template Binding

Use `[formField]="form.path.to.field"` instead of nested `formGroupName` directives.

</details>

<details>
<summary>Solution Files</summary>

See the complete solution in:

- `signal-forms-workshop/exercises/02-reactive-to-signal-form/solution/reactive-to-signal-form.ts` (utilities & cheat sheet)
- `signal-forms-workshop/exercises/02-reactive-to-signal-form/solution/reactive-form-solution.component.ts`
- `signal-forms-workshop/exercises/02-reactive-to-signal-form/solution/reactive-form-solution.component.html`
- `signal-forms-workshop/exercises/02-reactive-to-signal-form/solution/reactive-form-solution.component.scss`
- `signal-forms-workshop/exercises/02-reactive-to-signal-form/solution/example-component.ts` (inline example)

</details>
