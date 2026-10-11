// Solution for Exercise 01: Template-Driven Form → Signal Forms
// Demonstrates the migration from FormsModule/ngModel to the Signal Forms API (Angular 22).

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  max,
  min,
  minLength,
  required,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TemplateToSignalFormModel } from '@app/models/forms.models';

const INITIAL_VALUE: TemplateToSignalFormModel = {
  name: '',
  email: '',
  age: null,
  newsletter: false,
};

@Component({
  selector: 'app-template-form-solution',
  templateUrl: './template-form-solution.component.html',
  styleUrl: './template-form-solution.component.scss',
  imports: [
    FormField,
    FormRoot,
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
  // formData: TemplateToSignalFormModel = { name: '', email: '', age: null, newsletter: false };
  // + FormsModule, [(ngModel)], #ref="ngModel", required/minlength attributes, NgForm ...

  // ============================================
  // AFTER (Signal Forms):
  // ============================================

  // Step 1: A signal holds the data. It is the single source of truth, the form does not copy it.
  readonly formModel = signal<TemplateToSignalFormModel>(INITIAL_VALUE);

  // Submission feedback (set from the submission action)
  readonly submittedData = signal<TemplateToSignalFormModel | null>(null);

  // Step 2: form() wraps the model in a FieldTree. The schema function declares the rules once.
  readonly userForm = form(
    this.formModel,
    (path) => {
      // Name: required, min 2 characters
      required(path.name, { message: 'Name is required' });
      minLength(path.name, 2, { message: 'Name must be at least 2 characters' });

      // Email: required, valid email format
      required(path.email, { message: 'Email is required' });
      email(path.email, { message: 'Please enter a valid email address' });

      // Age: optional, but if provided must be 0-120
      min(path.age, 0, { message: 'Age cannot be negative' });
      max(path.age, 120, { message: 'Please enter a valid age' });

      // Newsletter: no rules needed (boolean)
    },
    {
      // Step 3: Submission is part of the form definition. [formRoot] in the template wires the
      // native submit event to it. The action only runs when the form is valid.
      submission: {
        action: async (field) => {
          await this.fakeApiCall();
          this.submittedData.set(field().value());
          console.log('Form submitted:', field().value());
          // No return value = success. Return ValidationErrors to show server-side errors.
        },
        // Validation failed: all fields are marked as touched, focus the first invalid control.
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  onReset(): void {
    // reset() clears touched/dirty on every field and (optionally) sets a new value
    this.userForm().reset(INITIAL_VALUE);
    this.submittedData.set(null);
  }

  private fakeApiCall(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
}
