# Exercise 01 – Template-Driven Form to Signal Forms

## Goals

In this exercise, you will learn how to migrate a traditional Angular Template-Driven Form to the new Signal Forms API.

You will:

- Understand the differences between Template-Driven Forms and Signal Forms
- Replace `FormsModule` and `ngModel` with `FormField` and signals
- Migrate validation from template attributes to the Signal Forms validation schema
- Use signals for reactive form state management

## Prerequisites

- Understanding of Angular Template-Driven Forms (`FormsModule`, `ngModel`)
- Basic knowledge of Angular Signals (`signal()`, `computed()`)

## Setup

1. Start the dev server: `npm run start`
2. Navigate to `http://localhost:4200/template-form`
3. Open the component at `src/app/components/template-form/`

## The Starting Point

The existing Template-Driven Form uses:

- `FormsModule` with `[(ngModel)]` for two-way binding
- Template reference variables (`#nameInput="ngModel"`) for validation access
- Built-in validators as HTML attributes (`required`, `email`, `minlength`, etc.)
- `#userForm="ngForm"` for form-level state

## Tasks

### Task 1: Update Imports

Replace the `FormsModule` import with Signal Forms.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
import { FormsModule, NgForm } from '@angular/forms';

// AFTER
import { FormField, form, required, email, minLength, min, max } from '@angular/forms/signals';
```

</details>

### Task 2: Create the Model Signal

Replace the plain object with a signal.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
formData: TemplateToSignalFormModel = {
  name: '',
  email: '',
  age: null,
  newsletter: false
};

// AFTER
formModel = signal<TemplateToSignalFormModel>({
  name: '',
  email: '',
  age: null,
  newsletter: false
});
```

</details>

### Task 3: Create the Form with Validation Schema

Add validators using the Signal Forms API.

<details>
<summary>Show Solution</summary>

```typescript
userForm = form(this.formModel, schema => {
  required(schema.name, { message: 'Name is required' });
  minLength(schema.name, 2, { message: 'Name must be at least 2 characters' });

  required(schema.email, { message: 'Email is required' });
  email(schema.email, { message: 'Please enter a valid email address' });

  min(schema.age, 0, { message: 'Age cannot be negative' });
  max(schema.age, 120, { message: 'Please enter a valid age' });
});
```

</details>

### Task 4: Update the Template

Replace `ngModel` bindings with `formField` and update validation error display.

<details>
<summary>Show Solution</summary>

**Input Bindings:**

```html
<!-- BEFORE -->
<input [(ngModel)]="formData.name" #nameInput="ngModel" required minlength="2" />

<!-- AFTER -->
<input [formField]="userForm.name" />
```

**Validation Error Display:**

```html
<!-- BEFORE -->
@if (nameInput.invalid && nameInput.touched) {
  @if (nameInput.errors?.['required']) {
    <span class="error">Name is required</span>
  }
}

<!-- AFTER -->
@if (userForm.name().invalid() && userForm.name().touched()) {
  @for (error of userForm.name().errors(); track error.message) {
    <span class="error">{{ error.message }}</span>
  }
}
```

</details>

### Task 5: Update Form State Access

Update the submit button disabled state and debug output.

<details>
<summary>Show Solution</summary>

```html
<!-- BEFORE -->
<button [disabled]="userForm.invalid">Submit</button>
<p>Valid: {{ userForm.valid }}</p>
<pre>{{ userForm.value | json }}</pre>

<!-- AFTER -->
<button [disabled]="userForm().invalid()">Submit</button>
<p>Valid: {{ userForm().valid() }}</p>
<pre>{{ formModel() | json }}</pre>
```

</details>

### Task 6: Update Reset Logic

Update the reset method to use signal updates.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
onReset(form: NgForm): void {
  form.resetForm();
  this.formData = { name: '', email: '', age: null, newsletter: false };
}

// AFTER
onReset(): void {
  this.formModel.set({ name: '', email: '', age: null, newsletter: false });
}
```

</details>

### Task 7: Use the `submit()` Function (Bonus)

Replace manual submit handling with the Signal Forms `submit()` function for proper async handling and error management.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE (manual validation check)
onSubmit(): void {
  if (this.userForm().valid()) {
    this.submitted.set(true);
    this.submittedData.set({ ...this.formModel() });
  }
}

// AFTER (using submit() function)
async onSubmit(): Promise<void> {
  await submit(this.userForm, async (form) => {
    try {
      const data = form().value();
      // Async operation (e.g., API call)
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

**Benefits of `submit()`:**

- Automatically checks validation before calling callback
- Sets `form().submitting()` to `true` during async operation
- Marks all fields as touched
- Handles `processing_error` for async failures
- Returns structured error information

**Template updates for submitting state:**

```html
<button type="submit" [disabled]="!isFormValid() || userForm().submitting()">
  @if (userForm().submitting()) {
    Submitting...
  } @else {
    Submit
  }
</button>

@if (userForm().processingError(); as error) {
  <div class="error-banner">Error: {{ error }}</div>
}
```

</details>

## Completion Criteria

- [ ] `FormsModule` replaced with `FormField` from `@angular/forms/signals`
- [ ] Model is a `signal<TemplateToSignalFormModel>`
- [ ] Form created with `form()` function and validation schema
- [ ] All `[(ngModel)]` replaced with `[formField]`
- [ ] Error messages display correctly using `form.field().errors()`
- [ ] Form validity check uses `form().valid()`
- [ ] Reset uses `formModel.set(initialValues)`
- [ ] (Bonus) Submit uses `submit()` function with async error handling

<details>
<summary>Migration Cheat Sheet</summary>

| Template-Driven | Signal Forms |
|-----------------|--------------|
| `FormsModule` | `FormField` |
| `[(ngModel)]="formData.name"` | `[formField]="form.name"` |
| `#ref="ngModel"` | `form.name()` |
| `ref.errors?.['required']` | `form.name().errors()` |
| `ref.invalid` | `form.name().invalid()` |
| `ref.touched` | `form.name().touched()` |
| `ngForm.valid` | `form().valid()` |
| `ngForm.value` | `formModel()` |
| `required` attribute | `required(schema.field, { message })` |
| `email` attribute | `email(schema.field, { message })` |
| `minlength="N"` | `minLength(schema.field, N, { message })` |
| Manual `if (valid)` check | `submit(form, callback)` |
| N/A | `form().submitting()` |
| N/A | `form().processingError()` |

</details>

<details>
<summary>Hints</summary>

- The Signal Forms API is imported from `@angular/forms/signals`
- Error messages are centralized in the validation schema (not in the template)
- Access field state by calling the field as a function: `form.name().invalid()`
- Access form state by calling the form as a function: `form().valid()`
- The model signal is the source of truth - read it with `formModel()`

</details>

<details>
<summary>Solution Files</summary>

See the complete solution in:

- `signal-forms-workshop/exercises/01-template-to-signal-form/solution/template-form-solution.component.ts`
- `signal-forms-workshop/exercises/01-template-to-signal-form/solution/template-form-solution.component.html`
- `signal-forms-workshop/exercises/01-template-to-signal-form/solution/template-to-signal-form.ts` (utilities & cheat sheet)

</details>
