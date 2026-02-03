// Exercise 04 Solution: Dynamic JSON Form with Signal Forms
// This demonstrates how to build forms dynamically from JSON definitions using Signal Forms API

import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  FormField,
  form,
  required,
  email,
  minLength,
  maxLength,
  min,
  max,
  validate,
} from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {
  FieldDefinition,
  FormDefinition,
  FORM_DEFINITION,
  createInitialModel,
} from '../form-definition';

// Type for our dynamic form model
type DynamicFormModel = Record<string, unknown>;

@Component({
  selector: 'app-dynamic-json-form-solution',
  templateUrl: './dynamic-json-form.component.html',
  styleUrl: './dynamic-json-form.component.scss',
  imports: [
    FormField,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicJsonFormSolutionComponent {
  // Form definition (could be loaded from API)
  readonly definition = signal<FormDefinition>(FORM_DEFINITION);

  // Signal-based model created from the definition
  readonly formModel = signal<DynamicFormModel>(
    createInitialModel(this.definition())
  );

  // Create Signal Form with dynamic validation schema
  readonly dynamicForm = form(this.formModel, (schema) => {
    // Dynamically apply validators based on field definitions
    for (const field of this.definition().fields) {
      // Cast to Record for dynamic key access - Signal Forms schema is typed based on the model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldSchema = (schema as Record<string, any>)[field.name];

      if (!fieldSchema) continue;

      // Required validation
      if (field.required) {
        required(fieldSchema, { message: `${field.label} is required` });
      }

      // Email validation
      if (field.type === 'email') {
        email(fieldSchema, { message: 'Please enter a valid email address' });
      }

      // Min/Max length for strings
      if (field.minLength !== undefined) {
        minLength(fieldSchema, field.minLength, {
          message: `Minimum ${field.minLength} characters required`,
        });
      }
      if (field.maxLength !== undefined) {
        maxLength(fieldSchema, field.maxLength, {
          message: `Maximum ${field.maxLength} characters allowed`,
        });
      }

      // Min/Max for numbers
      if (field.type === 'number') {
        if (field.min !== undefined) {
          min(fieldSchema, field.min, {
            message: `Minimum value is ${field.min}`,
          });
        }
        if (field.max !== undefined) {
          max(fieldSchema, field.max, {
            message: `Maximum value is ${field.max}`,
          });
        }
      }
    }
  });

  // State
  readonly submitted = signal(false);
  readonly submittedData = signal<DynamicFormModel | null>(null);

  // Computed: Check if form is valid
  readonly isFormValid = computed(() => this.dynamicForm().valid());

  // Helper: Get form field by name for template binding
  // Note: This uses type assertion because we're working with dynamic keys
  getField(fieldName: string) {
    return (this.dynamicForm as Record<string, unknown>)[fieldName] as ReturnType<
      typeof this.dynamicForm
    >;
  }

  // Helper: Get field value for display
  getFieldValue(fieldName: string): unknown {
    return this.formModel()[fieldName];
  }

  // Helper: Get icon for field type
  getFieldIcon(type: string): string {
    const icons: Record<string, string> = {
      text: 'text_fields',
      email: 'email',
      number: 'numbers',
      textarea: 'notes',
      select: 'list',
      checkbox: 'check_box',
    };
    return icons[type] || 'input';
  }

  // Submit handler
  onSubmit(): void {
    if (this.dynamicForm().valid()) {
      this.submitted.set(true);
      this.submittedData.set({ ...this.formModel() });
      console.log('Form submitted:', this.submittedData());
    }
  }

  // Reset handler
  onReset(): void {
    this.formModel.set(createInitialModel(this.definition()));
    this.submitted.set(false);
    this.submittedData.set(null);
  }
}
