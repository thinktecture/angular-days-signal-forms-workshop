// Exercise 04: Dynamic JSON Form with Signal Forms
// This is the starting point. Your task is to build a dynamic form using Signal Forms API.
//
// Steps:
// 1. Import Signal Forms: form, FormField, required, email, minLength, maxLength, min, max, validate
// 2. Create a signal-based model from the form definition
// 3. Dynamically apply validators based on field definitions
// 4. Use [formField] directive with computed field references
// 5. Render form controls dynamically based on field type

import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// TODO: Import Signal Forms API
// import {
//   FormField,
//   form,
//   required,
//   email,
//   minLength,
//   maxLength,
//   min,
//   max,
//   validate,
// } from '@angular/forms/signals';

import {
  FieldDefinition,
  FormDefinition,
  FORM_DEFINITION,
  createInitialModel,
} from '../form-definition';

@Component({
  selector: 'app-dynamic-json-form-exercise',
  templateUrl: './dynamic-json-form.component.html',
  styleUrl: './dynamic-json-form.component.scss',
  imports: [
    // TODO: Add FormField to imports
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
export class DynamicJsonFormExerciseComponent {
  // Form definition (could be loaded from API)
  readonly definition = signal<FormDefinition>(FORM_DEFINITION);

  // TODO: Step 1 - Create a signal-based model from the definition
  // Hint: Use createInitialModel() helper to generate initial values
  //
  // readonly formModel = signal<Record<string, unknown>>(
  //   createInitialModel(this.definition())
  // );

  // TODO: Step 2 - Create the Signal Form with dynamic validation
  // The challenge: How to apply validators dynamically based on field definitions?
  //
  // Approach A: Apply validators in schema function by iterating over fields
  // readonly dynamicForm = form(this.formModel, (schema) => {
  //   for (const field of this.definition().fields) {
  //     const fieldSchema = schema[field.name as keyof typeof schema];
  //     if (field.required) {
  //       required(fieldSchema, { message: `${field.label} is required` });
  //     }
  //     if (field.type === 'email') {
  //       email(fieldSchema, { message: 'Please enter a valid email' });
  //     }
  //     if (field.minLength) {
  //       minLength(fieldSchema, field.minLength, {
  //         message: `Minimum ${field.minLength} characters`
  //       });
  //     }
  //     // ... more validators
  //   }
  // });
  //
  // Approach B: Use validate() for custom validation per field
  // validate(schema[field.name], (ctx) => {
  //   const value = ctx.value();
  //   // Custom validation logic
  //   return null; // or { kind: 'custom', message: '...' }
  // });

  // State
  readonly submitted = signal(false);
  readonly submittedData = signal<Record<string, unknown> | null>(null);

  // TODO: Step 3 - Create helper to get form field by name
  // This is needed because Signal Forms uses typed schema paths
  //
  // getField(fieldName: string) {
  //   return this.dynamicForm[fieldName as keyof typeof this.dynamicForm];
  // }

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

  // TODO: Step 4 - Implement submit handler
  // onSubmit(): void {
  //   if (this.dynamicForm().valid()) {
  //     this.submitted.set(true);
  //     this.submittedData.set({ ...this.formModel() });
  //     console.log('Form submitted:', this.submittedData());
  //   }
  // }

  // TODO: Step 5 - Implement reset handler
  // onReset(): void {
  //   this.formModel.set(createInitialModel(this.definition()));
  //   this.submitted.set(false);
  //   this.submittedData.set(null);
  // }

  // Placeholder methods (remove after implementing)
  onSubmit(): void {
    console.log('TODO: Implement onSubmit');
  }

  onReset(): void {
    console.log('TODO: Implement onReset');
  }
}
