# Exercise 06 – Dynamic JSON Form with Signal Forms

## Goals

In this exercise, you will learn how to **dynamically build Signal Forms from a JSON schema definition** (Forms over Data pattern). This is a common real-world scenario where form structures come from a backend API or configuration.

You'll understand:

- How to create a signal-based model from dynamic field definitions
- How to apply validators dynamically based on field configuration
- How to bind Signal Form fields dynamically in templates
- The differences between statically-typed and dynamically-typed form approaches

## Prerequisites

- Completion of Exercises 01-05
- Understanding of Angular Signal Forms basics
- Familiarity with dynamic form generation concepts

## Use Case: Configurable Contact Form

We're building a form that:
- Reads its structure from a JSON definition
- Dynamically creates form fields based on the definition
- Applies validation rules specified in the definition
- Renders appropriate input controls for each field type

## Setup

1. Navigate to the application at `http://localhost:4200/dynamic-json-form`
2. Open the template at `signal-forms-workshop/exercises/06-dynamic-json-form/template/`
3. Review the form definition at `signal-forms-workshop/exercises/06-dynamic-json-form/form-definition.ts`

## Form Definition Structure

```typescript
interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'checkbox' | 'select';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

interface FormDefinition {
  title: string;
  fields: FieldDefinition[];
}
```

## Tasks

### Task 1: Import Signal Forms API

Replace the placeholder imports with Signal Forms:

```typescript
import {
  FormField,
  form,
  required,
  email,
  minLength,
  maxLength,
  min,
  max,
} from '@angular/forms/signals';
```

Add `FormField` to your component's imports array.

### Task 2: Create Signal-Based Model

Create a signal that holds your form data, initialized from the definition:

```typescript
readonly formModel = signal<Record<string, unknown>>(
  createInitialModel(this.definition())
);
```

### Task 3: Create Dynamic Signal Form with Validation

Build the form with a dynamic validation schema:

```typescript
readonly dynamicForm = form(this.formModel, (schema) => {
  for (const field of this.definition().fields) {
    // Cast schema to Record for dynamic key access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldSchema = (schema as Record<string, any>)[field.name];

    if (!fieldSchema) continue;

    if (field.required) {
      required(fieldSchema, { message: `${field.label} is required` });
    }
    if (field.type === 'email') {
      email(fieldSchema, { message: 'Please enter a valid email' });
    }
    if (field.minLength) {
      minLength(fieldSchema, field.minLength, {
        message: `Minimum ${field.minLength} characters`
      });
    }
    // ... more validators based on field definition
  }
});
```

> **Note:** We use `any` here because the schema type is derived from `Record<string, unknown>`, and TypeScript cannot know the concrete field types at compile time. This is a trade-off when building dynamic forms.

### Task 4: Create Field Access Helper

Since we're working with dynamic keys, create a helper method:

```typescript
getField(fieldName: string) {
  return (this.dynamicForm as Record<string, unknown>)[fieldName];
}
```

### Task 5: Bind Form Fields in Template

Use the `[formField]` directive with your helper:

```html
@for (field of definition().fields; track field.name) {
  @if (field.type === 'text' || field.type === 'email') {
    <mat-form-field>
      <mat-label>{{ field.label }}</mat-label>
      <input matInput [formField]="getField(field.name)" />

      @if (getField(field.name)().touched() && getField(field.name)().invalid()) {
        <mat-error>{{ getField(field.name)().errors()[0]?.message }}</mat-error>
      }
    </mat-form-field>
  }
  <!-- Handle other field types... -->
}
```

### Task 6: Implement Submit and Reset

```typescript
onSubmit(): void {
  if (this.dynamicForm().valid()) {
    this.submitted.set(true);
    this.submittedData.set({ ...this.formModel() });
  }
}

onReset(): void {
  this.formModel.set(createInitialModel(this.definition()));
  this.submitted.set(false);
  this.submittedData.set(null);
}
```

## Completion Criteria

- [ ] Signal Forms API is imported and FormField added to imports
- [ ] Form model is created as a signal from the definition
- [ ] Validators are applied dynamically based on field definitions
- [ ] All field types render correctly (text, email, number, textarea, select, checkbox)
- [ ] Validation errors display properly for each field
- [ ] Form submission outputs the collected data
- [ ] Reset restores the form to initial state

## Key Concepts

### Static vs Dynamic Signal Forms

| Aspect | Static Form | Dynamic Form |
|--------|-------------|--------------|
| Model | Typed interface | `Record<string, unknown>` |
| Schema | Known at compile time | Built at runtime |
| Field Access | `form.fieldName` | `form[fieldName]` (with casting) |
| Type Safety | Full | Partial (runtime checks) |

### Available Signal Forms Validators

From `@angular/forms/signals`:
- `required()` - Field must have a value
- `email()` - Must be valid email format
- `minLength(n)` - Minimum string/array length
- `maxLength(n)` - Maximum string/array length
- `min(n)` - Minimum numeric value
- `max(n)` - Maximum numeric value
- `pattern(regex)` - Must match regex pattern
- `validate()` - Custom validation function

## Hints

- Use `createInitialModel()` helper to generate initial values from definition
- Cast schema for dynamic key access: `(schema as Record<string, any>)[field.name]`
- Always check if `fieldSchema` exists before applying validators
- Remember to handle each field type in your template switch/if blocks
- Validation errors are in an array: `field().errors()[0]?.message`

## Solution

The complete solution is available in the `solution/` folder:
- `dynamic-json-form.component.ts` - Component with dynamic Signal Form
- `dynamic-json-form.component.html` - Template with dynamic field rendering
- `dynamic-json-form.component.scss` - Styles

## References

- [Angular Signal Forms Validation](https://angular.dev/guide/forms/signals/validation)
- [Signal Forms Overview](https://angular.dev/guide/forms/signals/overview)
- [Signal Forms Deep Dive](https://angular.love/signal-forms-in-angular-21-complete-guide/)
