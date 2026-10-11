# Exercise 01 – Template-Driven Form to Signal Forms

## Goals

In this exercise, you migrate a classic Template-Driven Form to the Signal Forms API (`@angular/forms/signals`).

You will:

- Replace `FormsModule` / `ngModel` with a model signal and the `FormField` directive
- Move the validation rules from template attributes into a schema function
- Wire up submission with `FormRoot` and a `submission` action
- Read form and field state from signals (`valid()`, `touched()`, `errors()`, `submitting()`)

## Prerequisites

- Understanding of Template-Driven Forms (`FormsModule`, `ngModel`)
- Basic knowledge of Angular Signals (`signal()`, `computed()`)

## Setup

1. Start the dev server: `npm run start`
2. Navigate to `http://localhost:4200/template-form`
3. Open `src/app/components/template-form/`
4. Compare with the running solution at `http://localhost:4200/solutions/template-form`

## The Starting Point

The existing Template-Driven Form uses:

- `FormsModule` with `[(ngModel)]` for two-way binding
- Template reference variables (`#nameInput="ngModel"`) to access validation state
- Validators as HTML attributes (`required`, `email`, `minlength`, `min`, `max`)
- `#userForm="ngForm"` for the form-level state and `(ngSubmit)`

## Tasks

### Task 1: Update Imports

Replace the `FormsModule` import with the Signal Forms API.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
import { FormsModule, NgForm } from '@angular/forms';

// AFTER
import { FormField, FormRoot, email, form, max, min, minLength, required } from '@angular/forms/signals';

@Component({
  imports: [FormField, FormRoot, /* Material modules */],
})
```

</details>

### Task 2: Create the Model Signal

The data lives in a signal. The form does not copy it, it works directly on this signal.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
formData: TemplateToSignalFormModel = { name: '', email: '', age: null, newsletter: false };

// AFTER
const INITIAL_VALUE: TemplateToSignalFormModel = { name: '', email: '', age: null, newsletter: false };

readonly formModel = signal<TemplateToSignalFormModel>(INITIAL_VALUE);
```

</details>

### Task 3: Create the Form with a Schema

`form()` wraps the model in a `FieldTree`. The schema function receives a `path` object that mirrors the model and
registers rules for the fields. It runs once at setup.

<details>
<summary>Show Solution</summary>

```typescript
readonly userForm = form(this.formModel, (path) => {
  required(path.name, { message: 'Name is required' });
  minLength(path.name, 2, { message: 'Name must be at least 2 characters' });

  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Please enter a valid email address' });

  min(path.age, 0, { message: 'Age cannot be negative' });
  max(path.age, 120, { message: 'Please enter a valid age' });
});
```

</details>

### Task 4: Update the Template

Bind the inputs with `[formField]` and read the errors from the field state. Do not set `required`, `minlength`,
`min` or `max` attributes anymore, the directive binds them from the schema (the compiler rejects them).

<details>
<summary>Show Solution</summary>

```html
<!-- BEFORE -->
<input [(ngModel)]="formData.name" #nameInput="ngModel" required minlength="2" />
@if (nameInput.invalid && nameInput.touched) { @if (nameInput.errors?.['required']) {
<mat-error>Name is required</mat-error>
} }

<!-- AFTER -->
<input matInput [formField]="userForm.name" />
@if (userForm.name().touched() && userForm.name().invalid()) { @for (error of
userForm.name().errors(); track error.kind) {
<mat-error>{{ error.message }}</mat-error>
} }

<!-- Checkbox -->
<mat-checkbox [formField]="userForm.newsletter">Subscribe to newsletter</mat-checkbox>
```

</details>

### Task 5: Submission with FormRoot

Submission is part of the form definition. `[formRoot]` on the `<form>` sets `novalidate`, prevents the default
submit and runs the `submission.action` when the form is valid. If it is invalid, `onInvalid` runs and all fields are
marked as touched.

<details>
<summary>Show Solution</summary>

```typescript
readonly submittedData = signal<TemplateToSignalFormModel | null>(null);

readonly userForm = form(
  this.formModel,
  (path) => { /* rules from Task 3 */ },
  {
    submission: {
      action: async (field) => {
        await this.fakeApiCall();
        this.submittedData.set(field().value());
        // no return value = success; return ValidationErrors to show server-side errors
      },
      onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
    },
  },
);
```

```html
<!-- BEFORE -->
<form #userForm="ngForm" (ngSubmit)="onSubmit()">
  <button type="submit" [disabled]="userForm.invalid">Submit</button>

  <!-- AFTER -->
  <form [formRoot]="userForm">
    <button type="submit" [disabled]="userForm().submitting()">
      @if (userForm().submitting()) { Submitting... } @else { Submit }
    </button>
  </form>
</form>
```

The submit button is not disabled while the form is invalid: submitting an invalid form shows the errors and
focuses the first invalid control.

</details>

### Task 6: Reset

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
onReset(form: NgForm): void {
  form.resetForm();
  this.formData = { name: '', email: '', age: null, newsletter: false };
}

// AFTER: reset() clears touched/dirty on all fields and optionally sets a new value
onReset(): void {
  this.userForm().reset(INITIAL_VALUE);
  this.submittedData.set(null);
}
```

</details>

### Task 7: Debug Output

Replace `userForm.valid`, `userForm.dirty` and `userForm.value | json` with signal reads.

<details>
<summary>Show Solution</summary>

```html
<p><strong>Valid:</strong> {{ userForm().valid() }}</p>
<p><strong>Dirty:</strong> {{ userForm().dirty() }}</p>
<p><strong>Touched:</strong> {{ userForm().touched() }}</p>
<p><strong>Submitting:</strong> {{ userForm().submitting() }}</p>
<pre>{{ formModel() | json }}</pre>
```

</details>

## Completion Criteria

- [ ] `FormsModule` replaced with `FormField` and `FormRoot`
- [ ] Model is a `signal<TemplateToSignalFormModel>`
- [ ] Form created with `form()` and a schema function
- [ ] All `[(ngModel)]` replaced with `[formField]`, no validation attributes left in the template
- [ ] Errors are rendered from `field().errors()`
- [ ] `<form [formRoot]>` with a `submission.action`, button shows `submitting()`
- [ ] Reset uses `userForm().reset(INITIAL_VALUE)`

<details>
<summary>Migration Cheat Sheet</summary>

| Template-Driven               | Signal Forms                                      |
| ----------------------------- | ------------------------------------------------- |
| `FormsModule`                 | `FormField`, `FormRoot`                           |
| `[(ngModel)]="formData.name"` | `[formField]="form.name"`                         |
| `#ref="ngModel"`              | `form.name()` (the `FieldState`)                  |
| `ref.errors?.['required']`    | `form.name().errors()` / `getError('required')`   |
| `ref.invalid` / `ref.touched` | `form.name().invalid()` / `form.name().touched()` |
| `#userForm="ngForm"`          | `[formRoot]="form"`                               |
| `ngForm.valid`                | `form().valid()`                                  |
| `ngForm.value`                | `formModel()` or `form().value()`                 |
| `required` attribute          | `required(path.field, { message })`               |
| `email` attribute             | `email(path.field, { message })`                  |
| `minlength="N"`               | `minLength(path.field, N, { message })`           |
| `(ngSubmit)` + manual check   | `submission: { action, onInvalid }`               |
| `form.resetForm()`            | `form().reset(value)`                             |

</details>

<details>
<summary>Hints</summary>

- Everything is imported from `@angular/forms/signals`
- The schema function runs once; reactive logic belongs into rule options (`when`) or `validate()`
- Field state is a function call: `form.name()`, form state as well: `form()`
- `valid()` is not `!invalid()`: both are `false` while async validators are pending

</details>

<details>
<summary>Solution Files</summary>

- `exercises/01-template-to-signal-form/solution/template-form-solution.component.ts`
- `exercises/01-template-to-signal-form/solution/template-form-solution.component.html`
- Running: `http://localhost:4200/solutions/template-form`

</details>
