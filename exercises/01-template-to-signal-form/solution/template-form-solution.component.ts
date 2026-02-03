// Solution for Exercise 01: Template-Driven Form → Signal Forms
// This component demonstrates the migration from ngModel/FormsModule to Signal Forms API

import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  FormField,
  form,
  submit,
  required,
  email,
  minLength,
  min,
  max,
} from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TemplateToSignalFormModel } from '../../../../src/app/models/forms.models';

@Component({
  selector: 'app-template-form-solution',
  templateUrl: './template-form-solution.component.html',
  styleUrl: './template-form-solution.component.scss',
  imports: [
    FormField,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateFormSolutionComponent {
  // ============================================
  // BEFORE (Template-Driven Form):
  // ============================================
  // formData: TemplateToSignalFormModel = {
  //   name: '',
  //   email: '',
  //   age: null,
  //   newsletter: false
  // };
  // + FormsModule, [(ngModel)], #ref="ngModel", etc.

  // ============================================
  // AFTER (Signal Forms):
  // ============================================

  // Step 1: Create a signal as the single source of truth for form data
  formModel = signal<TemplateToSignalFormModel>({
    name: '',
    email: '',
    age: null,
    newsletter: false,
  });

  // Step 2: Create the form with validation schema
  userForm = form(this.formModel, (schema) => {
    // Name: required, min 2 characters
    required(schema.name, { message: 'Name is required' });
    minLength(schema.name, 2, { message: 'Name must be at least 2 characters' });

    // Email: required, valid email format
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Please enter a valid email address' });

    // Age: optional, but if provided must be 0-120
    min(schema.age, 0, { message: 'Age cannot be negative' });
    max(schema.age, 120, { message: 'Please enter a valid age' });

    // Newsletter: no validation needed (boolean)
  });

  // State for submission feedback
  submitted = signal(false);
  submittedData = signal<TemplateToSignalFormModel | null>(null);

  // Computed: derive form validity state (reactive)
  isFormValid = computed(() => this.userForm().valid());
  isFormDirty = computed(() => this.userForm().dirty());
  isFormTouched = computed(() => this.userForm().touched());

  async onSubmit(): Promise<void> {
    await submit(this.userForm, async (form) => {
      try {
        // Simulate async operation (e.g., API call)
        const data = form().value();
        console.log('Form submitted:', data);

        this.submitted.set(true);
        this.submittedData.set({ ...data });

        return null; // Success: no error
      } catch (error) {
        return {
          kind: 'processing_error' as const,
          error: String(error),
        };
      }
    });
  }

  onReset(): void {
    // Reset the model signal to initial values
    this.formModel.set({
      name: '',
      email: '',
      age: null,
      newsletter: false,
    });
    this.submitted.set(false);
    this.submittedData.set(null);
  }
}
