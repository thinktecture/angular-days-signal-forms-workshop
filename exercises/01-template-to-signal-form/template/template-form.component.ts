// Exercise 01: Template-Driven Form → Signal Forms
// This is the starting point. Your task is to migrate this component to use Signal Forms.
//
// Steps:
// 1. Replace FormsModule with FormField from @angular/forms/signals
// 2. Convert formData object to a signal
// 3. Create a form with validation schema using form()
// 4. Replace [(ngModel)] with [formField] in the template
// 5. Update error display to use form.field().errors()
// 6. Update form state access to use form().valid()

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { TemplateToSignalFormModel } from '../../../../src/app/models/forms.models';

// TODO: Replace imports with Signal Forms
// import { signal, computed } from '@angular/core';
// import { FormField, form, submit, required, email, minLength, min, max } from '@angular/forms/signals';

@Component({
  selector: 'app-template-form-exercise',
  templateUrl: './template-form.component.html',
  styleUrl: './template-form.component.scss',
  imports: [
    FormsModule, // TODO: Replace with FormField
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateFormExerciseComponent {
  // TODO: Convert to signal
  // BEFORE:
  formData: TemplateToSignalFormModel = {
    name: '',
    email: '',
    age: null,
    newsletter: false,
  };

  // AFTER:
  // formModel = signal<TemplateToSignalFormModel>({
  //   name: '',
  //   email: '',
  //   age: null,
  //   newsletter: false,
  // });

  // TODO: Create form with validation schema
  // userForm = form(this.formModel, (schema) => {
  //   required(schema.name, { message: 'Name is required' });
  //   minLength(schema.name, 2, { message: 'Name must be at least 2 characters' });
  //   required(schema.email, { message: 'Email is required' });
  //   email(schema.email, { message: 'Please enter a valid email address' });
  //   min(schema.age, 0, { message: 'Age cannot be negative' });
  //   max(schema.age, 120, { message: 'Please enter a valid age' });
  // });

  submitted = false;
  submittedData: TemplateToSignalFormModel | null = null;

  // TODO: Update to use signal values
  // submitted = signal(false);
  // submittedData = signal<TemplateToSignalFormModel | null>(null);

  // TODO: Add computed signals for form state
  // isFormValid = computed(() => this.userForm().valid());

  onSubmit(): void {
    // TODO: Update to use Signal Forms submit()
    // BEFORE:
    this.submitted = true;
    this.submittedData = { ...this.formData };
    console.log('Form submitted:', this.submittedData);

    // AFTER:
    // await submit(this.userForm, async (form) => {
    //   try {
    //     const data = form().value();
    //     this.submitted.set(true);
    //     this.submittedData.set({ ...data });
    //     return null;
    //   } catch (error) {
    //     return { kind: 'processing_error' as const, error: String(error) };
    //   }
    // });
  }

  onReset(form: NgForm): void {
    // TODO: Update to reset signal
    // BEFORE:
    form.resetForm();
    this.formData = {
      name: '',
      email: '',
      age: null,
      newsletter: false,
    };
    this.submitted = false;
    this.submittedData = null;

    // AFTER:
    // this.formModel.set({
    //   name: '',
    //   email: '',
    //   age: null,
    //   newsletter: false,
    // });
    // this.submitted.set(false);
    // this.submittedData.set(null);
  }
}
