# Exercise 06 – Dynamic JSON Form (Forms over Data)

## Goals

The form structure comes from data (a JSON definition from an API or a configuration). Model, rules and controls
are generated from it. Your task: extend the definition and watch the form follow.

You will see:

- how a `Record<string, unknown>` model works with `form()`
- how rules are applied to dynamic keys in the schema function
- how the template looks up fields by name
- the trade-off: no static typing of the fields

## Prerequisites

- Completion of Exercises 01-05

## Setup

1. Navigate to `http://localhost:4200/dynamic-json-form`
2. Open `src/app/components/dynamic-json-form/`
3. Compare with the running solution at `http://localhost:4200/solutions/dynamic-json-form`

## How the Generator Works

`form-definition.ts` holds the definition and the mapping to rules:

```typescript
export interface FieldDefinition {
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

export type DynamicFormModel = Record<string, unknown>;

// The model has no static keys, so the schema path has none either: narrow it once per field
function pathOf<T>(path: SchemaPathTree<DynamicFormModel>, name: string): SchemaPath<T> {
  return (path as unknown as Record<string, SchemaPath<T>>)[name];
}

export function applyFieldRules(
  path: SchemaPathTree<DynamicFormModel>,
  field: FieldDefinition,
): void {
  if (field.required) required(pathOf(path, field.name), { message: `${field.label} is required` });
  if (field.type === 'email') email(pathOf<string>(path, field.name), { message: '...' });
  if (field.minLength !== undefined)
    minLength(pathOf<string>(path, field.name), field.minLength, { message: '...' });
  // ...
}
```

The component generates the three parts:

```typescript
// 1. Model
readonly formModel = signal<DynamicFormModel>(createInitialModel(this.definition));

// 2. Rules
readonly dynamicForm = form(this.formModel, (path) => {
  for (const field of this.definition.fields) {
    applyFieldRules(path, field);
  }
});

// 3. Controls: the template looks fields up by name. Native inputs are type-checked against the
//    field's value type, so the lookups narrow the type per control.
fieldFor(name: string): Field<unknown> { ... }                    // state, errors, mat-select, mat-checkbox
inputFieldFor(name: string): Field<string | number | null> { ... } // <input>
textareaFieldFor(name: string): Field<string> { ... }             // <textarea>
```

```html
@for (field of definition.fields; track field.name) { @let state = fieldFor(field.name)(); @switch
(field.type) { @case ('checkbox') {
<mat-checkbox [formField]="fieldFor(field.name)">{{ field.label }}</mat-checkbox> } @case ('select')
{ <mat-select [formField]="fieldFor(field.name)">...</mat-select> } @case ('textarea') {
<textarea matInput [formField]="textareaFieldFor(field.name)"></textarea> } @default {
<input matInput [type]="field.type" [formField]="inputFieldFor(field.name)" /> } } @if
(state.touched() && state.invalid()) { @for (error of state.errors(); track error.kind) {
<mat-error>{{ error.message }}</mat-error> } } }
```

## Tasks

### Task 1: Add a Field to the JSON

Add a required `phone` text field to `FORM_DEFINITION`. No component code needed.

<details>
<summary>Show Solution</summary>

```typescript
{
  name: 'phone',
  label: 'Phone',
  type: 'text',
  required: true,
  placeholder: '+49 123 456789',
},
```

The field appears, is required, and is part of the submitted data.

</details>

### Task 2 (Bonus): Add a `pattern` Rule to the Definition

Patterns arrive as strings from JSON. Extend `FieldDefinition` and `applyFieldRules()`.

<details>
<summary>Show Solution</summary>

```typescript
// FieldDefinition
pattern?: string;

// applyFieldRules()
if (field.pattern) {
  pattern(pathOf<string>(path, field.name), new RegExp(field.pattern), {
    message: `${field.label} has an invalid format`,
  });
}

// FORM_DEFINITION, phone field
pattern: '^\\+?[0-9 -]{6,}$',
```

</details>

### Task 3 (Optional): Think About It

- Where would `hidden()` / `disabled()` rules go in such a definition?
- How would you express "field B is required when field A has value X" in JSON?
- When does a typed schema (`validateStandardSchema()` with Zod) fit better than a field list?

## Completion Criteria

- [ ] The new field renders, validates and is part of the submitted data
- [ ] (Bonus) `pattern` works from the JSON definition
- [ ] No component code changed for Task 1

<details>
<summary>Static vs. Dynamic</summary>

| Aspect       | Static Form           | Dynamic Form                         |
| ------------ | --------------------- | ------------------------------------ |
| Model        | Typed interface       | `Record<string, unknown>`            |
| Schema       | Known at compile time | Built at runtime from the definition |
| Field access | `form.fieldName`      | `fieldFor(name)` with a cast         |
| Type safety  | Full                  | Only inside the generator            |
| Change       | Code change           | Data change                          |

</details>

<details>
<summary>Solution Files</summary>

- `exercises/06-dynamic-json-form/solution/form-definition.ts`
- `exercises/06-dynamic-json-form/solution/dynamic-json-form.component.ts`
- `exercises/06-dynamic-json-form/solution/dynamic-json-form.component.html`
- Running: `http://localhost:4200/solutions/dynamic-json-form`

</details>
