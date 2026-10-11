# Exercise 02 – Reactive Form to Signal Forms (partial migration with compatForm)

## Goals

Real applications cannot migrate every form at once. In this exercise you migrate a Reactive Form **top-down**:
the form becomes a Signal Form, but one control (the password with its custom `ValidatorFn`) stays a `FormControl`.

You will:

- Nest an existing `FormControl` inside the model signal and wrap it with `compatForm()`
- Migrate nested objects (`FormGroup`) and arrays (`FormArray`) to plain data plus `apply()` / `applyEach()`
- Replace the group-level cross-field validator with `validate()` and `valueOf()`
- Read `CompatValidationError`s from the kept control and unwrap the value with `extractValue()`

## Prerequisites

- Understanding of Reactive Forms (`FormGroup`, `FormControl`, `FormArray`, `Validators`)
- Completion of Exercise 01

## Setup

1. Navigate to `http://localhost:4200/reactive-form`
2. Open `src/app/components/reactive-form/`
3. Compare with the running solution at `http://localhost:4200/solutions/reactive-form`

## The Starting Point

- `FormBuilder` with a nested `FormGroup` (`address`) and a `FormArray` (`phoneNumbers`)
- Custom validator `passwordStrengthValidator` (we keep this one)
- Group validator `passwordMatchValidator` (we replace this one)
- `Validators.requiredTrue` for the terms checkbox

## Tasks

### Task 1: Update Imports

<details>
<summary>Show Solution</summary>

```typescript
// Still needed for the kept control
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';

import {
  FormField,
  FormRoot,
  ValidationError,
  apply,
  applyEach,
  email,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { CompatValidationError, compatForm, extractValue } from '@angular/forms/signals/compat';
```

Add `FormField` and `FormRoot` to the component `imports`, remove `ReactiveFormsModule`.

</details>

### Task 2: Keep the Password Control, Build the Model Signal

The `FormControl` becomes a leaf of the model. Everything else is plain data.

<details>
<summary>Show Solution</summary>

```typescript
type RegistrationModel = Omit<RegistrationFormModel, 'password'> & { password: FormControl<string> };

private readonly passwordControl = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, passwordStrengthValidator],
});

readonly formModel = signal<RegistrationModel>({
  firstName: '',
  lastName: '',
  email: '',
  password: this.passwordControl, // ← FormControl as a leaf
  confirmPassword: '',
  address: { street: '', city: '', postalCode: '', country: '' },
  phoneNumbers: [{ type: 'mobile', number: '' }],
  acceptTerms: false,
});
```

</details>

### Task 3: compatForm() with Rules for the Migrated Fields

`compatForm()` works like `form()` but understands `AbstractControl`s inside the model. You cannot add Signal
Forms rules to `path.password` (the control validates itself), but you can read it with `valueOf()`.

<details>
<summary>Show Solution</summary>

```typescript
// address.schema.ts - reusable
export const addressSchema = schema<Address>((address) => {
  required(address.street, { message: 'Street is required' });
  required(address.city, { message: 'City is required' });
  required(address.postalCode, { message: 'Postal code is required' });
  pattern(address.postalCode, /^\d{5}$/, { message: 'Postal code must be 5 digits' });
  required(address.country, { message: 'Country is required' });
});

readonly registrationForm = compatForm(this.formModel, (path) => {
  required(path.firstName, { message: 'First name is required' });
  minLength(path.firstName, 2, { message: 'First name must be at least 2 characters' });
  required(path.lastName, { message: 'Last name is required' });
  minLength(path.lastName, 2, { message: 'Last name must be at least 2 characters' });
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Please enter a valid email address' });

  // Cross-field: replaces passwordMatchValidator
  required(path.confirmPassword, { message: 'Please confirm your password' });
  validate(path.confirmPassword, ({ value, valueOf }) =>
    value() && value() !== valueOf(path.password)
      ? { kind: 'passwordMismatch', message: 'Passwords do not match' }
      : null,
  );

  // Nested object: replaces fb.group({...})
  apply(path.address, addressSchema);

  // Array: replaces fb.array([...]) + createPhoneNumberGroup()
  applyEach(path.phoneNumbers, (phone) => {
    required(phone.number, { message: 'Phone number is required' });
    pattern(phone.number, /^\+?[\d\s-]{6,}$/, { message: 'Invalid phone number format' });
  });

  // Replaces Validators.requiredTrue: required() treats `false` as empty
  required(path.acceptTerms, { message: 'You must accept the terms' });
});
```

</details>

### Task 4: Template

`[formField]` binds compat fields exactly like Signal Forms fields. Arrays are iterated on the `FieldTree`
itself, nested fields are reached by property access.

<details>
<summary>Show Solution</summary>

```html
<form [formRoot]="registrationForm">
  <!-- BEFORE: formControlName="firstName" -->
  <input matInput [formField]="registrationForm.firstName" />

  <!-- The kept FormControl -->
  <input matInput type="password" [formField]="registrationForm.password" />
  @if (registrationForm.password().touched() && registrationForm.password().invalid()) { @for (error
  of registrationForm.password().errors(); track error.kind) {
  <mat-error>{{ passwordErrorMessage(error) }}</mat-error>
  } }

  <!-- BEFORE: formGroupName="address" + formControlName="street" -->
  <input matInput [formField]="registrationForm.address.street" />

  <!-- BEFORE: @for (phone of phoneNumbers.controls) with [formGroupName]="i" -->
  @for (phone of registrationForm.phoneNumbers; track phone; let i = $index) {
  <mat-select [formField]="phone.type">...</mat-select>
  <input matInput [formField]="phone.number" />
  <button type="button" (click)="removePhoneNumber(i)">Remove</button>
  }

  <mat-checkbox [formField]="registrationForm.acceptTerms">I accept the terms</mat-checkbox>
</form>
```

Errors of the kept control are `CompatValidationError`s: `kind` is the Reactive Forms error key, `context` the
error value, and there is no `message`. Map them in the component:

```typescript
passwordErrorMessage(error: ValidationError): string {
  switch (error.kind) {
    case 'required':
      return 'Password is required';
    case 'passwordStrength': {
      const { missing } = (error as CompatValidationError<{ missing: string[] }>).context;
      return `Password must contain: ${missing.join(', ')}`;
    }
    default:
      return 'Invalid password';
  }
}
```

</details>

### Task 5: Array Operations

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE: this.phoneNumbers.push(this.createPhoneNumberGroup()) / removeAt(index)
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

</details>

### Task 6: Submission and Reset

The raw model contains the `FormControl` object. `extractValue()` unwraps it into plain data.

<details>
<summary>Show Solution</summary>

```typescript
readonly registrationForm = compatForm(this.formModel, schema, {
  submission: {
    action: async () => {
      await this.fakeApiCall();
      const data = extractValue(this.registrationForm); // RegistrationFormModel
      this.submittedData.set(data);
    },
    onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
  },
});

onReset(): void {
  this.formModel.set({ ...INITIAL_VALUE, password: this.passwordControl });
  this.passwordControl.reset('');
  this.registrationForm().reset();
  this.submittedData.set(null);
}
```

</details>

### Bonus: Bottom-up with SignalFormControl

The opposite direction: keep the `FormGroup`, migrate single controls.

```typescript
import { SignalFormControl } from '@angular/forms/signals/compat';

emailControl = new SignalFormControl('', (p) => {
  required(p, { message: 'Email is required' });
});

form = new FormGroup({
  name: new FormControl('Alice'),
  email: this.emailControl, // bidirectionally synchronized
});
```

```html
<form [formGroup]="form">
  <input formControlName="name" />
  <input [formField]="emailControl.fieldTree" />
</form>
```

## Completion Criteria

- [ ] `ReactiveFormsModule` removed, `FormField` and `FormRoot` imported
- [ ] Password stays a `FormControl` inside the model signal
- [ ] `compatForm()` with rules for all migrated fields
- [ ] `addressSchema` applied with `apply()`, phone rules with `applyEach()`
- [ ] Password match implemented with `validate()` + `valueOf(path.password)`
- [ ] Phone numbers iterate over `registrationForm.phoneNumbers`
- [ ] Submission uses `extractValue()`

<details>
<summary>Migration Cheat Sheet</summary>

| Reactive Forms                        | Signal Forms                                                 |
| ------------------------------------- | ------------------------------------------------------------ |
| `ReactiveFormsModule`                 | `FormField`, `FormRoot`                                      |
| `FormBuilder` / `FormGroup`           | `signal()` + `form()` (or `compatForm()` during migration)   |
| `FormArray`                           | Array in the model + `applyEach()`                           |
| `formControlName="x"`                 | `[formField]="form.x"`                                       |
| `formGroupName="x"`                   | `form.x.child`                                               |
| `[formGroupName]="i"`                 | `@for (item of form.items; track item)`                      |
| `Validators.required`                 | `required(path.field, { message })`                          |
| `Validators.requiredTrue`             | `required(path.checkbox)`                                    |
| `Validators.pattern(r)`               | `pattern(path.field, r, { message })`                        |
| Custom `ValidatorFn`                  | `validate(path.field, (ctx) => ...)`                         |
| Group validator                       | `validate()` + `ctx.valueOf(path.other)` or `validateTree()` |
| `formArray.push()` / `removeAt(i)`    | `model.update()` with spread / filter                        |
| `control.errors['key']`               | `form.field().errors()` / `getError('key')`                  |
| `form.markAllAsTouched()`             | handled by the submission (`onInvalid`)                      |
| Kept `FormControl` inside the model   | `compatForm()`, `extractValue()`                             |
| Kept `FormGroup` around signal fields | `SignalFormControl`                                          |

</details>

<details>
<summary>Solution Files</summary>

- `exercises/02-reactive-to-signal-form/solution/reactive-form-solution.component.ts`
- `exercises/02-reactive-to-signal-form/solution/reactive-form-solution.component.html`
- `exercises/02-reactive-to-signal-form/solution/address.schema.ts`
- Running: `http://localhost:4200/solutions/reactive-form`

</details>
