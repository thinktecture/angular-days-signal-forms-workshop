// Solution for Exercise 06: the JSON form definition with the added phone field and pattern support.

import {
  SchemaPath,
  SchemaPathTree,
  email,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';

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
  // Bonus: regex as string, e.g. "^\\+?[0-9 ]{6,}$"
  pattern?: string;
}

export interface FormDefinition {
  title: string;
  fields: FieldDefinition[];
}

// The model has no static keys - every field is just a key in a Record.
export type DynamicFormModel = Record<string, unknown>;

// This could come from an API
export const FORM_DEFINITION: FormDefinition = {
  title: 'Contact Form',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      minLength: 2,
      placeholder: 'Enter your first name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      minLength: 2,
      placeholder: 'Enter your last name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'your.email@example.com',
    },
    // Task 1: the new field - no component code needed
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: true,
      pattern: '^\\+?[0-9 -]{6,}$',
      placeholder: '+49 123 456789',
    },
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      min: 18,
      max: 120,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
      ],
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
      maxLength: 500,
      placeholder: 'Tell us about yourself...',
    },
    {
      name: 'newsletter',
      label: 'Subscribe to newsletter',
      type: 'checkbox',
    },
  ],
};

// Creates the initial model value from the definition
export function createInitialModel(definition: FormDefinition): DynamicFormModel {
  const model: DynamicFormModel = {};
  for (const field of definition.fields) {
    switch (field.type) {
      case 'checkbox':
        model[field.name] = false;
        break;
      case 'number':
        model[field.name] = null;
        break;
      default:
        model[field.name] = '';
    }
  }
  return model;
}

// The model is a Record<string, unknown>, so the schema path has no typed keys.
// This helper narrows a dynamic key to a typed SchemaPath once, so the rules stay type-safe.
function pathOf<T>(path: SchemaPathTree<DynamicFormModel>, name: string): SchemaPath<T> {
  return (path as unknown as Record<string, SchemaPath<T>>)[name];
}

// Translates one field definition into Signal Forms rules
export function applyFieldRules(
  path: SchemaPathTree<DynamicFormModel>,
  field: FieldDefinition,
): void {
  if (field.required) {
    required(pathOf(path, field.name), { message: `${field.label} is required` });
  }
  if (field.type === 'email') {
    email(pathOf<string>(path, field.name), { message: 'Please enter a valid email address' });
  }
  if (field.minLength !== undefined) {
    minLength(pathOf<string>(path, field.name), field.minLength, {
      message: `Minimum ${field.minLength} characters`,
    });
  }
  if (field.maxLength !== undefined) {
    maxLength(pathOf<string>(path, field.name), field.maxLength, {
      message: `Maximum ${field.maxLength} characters`,
    });
  }
  if (field.min !== undefined) {
    min(pathOf<number | null>(path, field.name), field.min, {
      message: `Minimum value is ${field.min}`,
    });
  }
  if (field.max !== undefined) {
    max(pathOf<number | null>(path, field.name), field.max, {
      message: `Maximum value is ${field.max}`,
    });
  }
  // Task 2: patterns arrive as strings from JSON
  if (field.pattern) {
    pattern(pathOf<string>(path, field.name), new RegExp(field.pattern), {
      message: `${field.label} has an invalid format`,
    });
  }
}
