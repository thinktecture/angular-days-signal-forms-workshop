// Solution for Exercise 02: Reactive Form → Signal Forms
// This component demonstrates the migration from FormBuilder/ReactiveFormsModule to Signal Forms API

import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormField, form, submit, required, email, minLength, pattern } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationFormModel, PhoneNumber } from '../../../../src/app/models/forms.models';

@Component({
  selector: 'app-reactive-form-solution',
  templateUrl: './reactive-form-solution.component.html',
  styleUrl: './reactive-form-solution.component.scss',
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
export class ReactiveFormSolutionComponent {
  // ============================================
  // BEFORE (Reactive Forms):
  // ============================================
  // private fb = inject(FormBuilder);
  // registrationForm: FormGroup = this.fb.group({
  //   firstName: ['', [Validators.required, Validators.minLength(2)]],
  //   lastName: ['', [Validators.required, Validators.minLength(2)]],
  //   email: ['', [Validators.required, Validators.email]],
  //   password: ['', [Validators.required, passwordStrengthValidator]],
  //   confirmPassword: ['', [Validators.required]],
  //   address: this.fb.group({
  //     street: ['', [Validators.required]],
  //     city: ['', [Validators.required]],
  //     postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
  //     country: ['', [Validators.required]],
  //   }),
  //   phoneNumbers: this.fb.array([...]),
  //   acceptTerms: [false, [Validators.requiredTrue]],
  // }, { validators: [passwordMatchValidator] });

  // ============================================
  // AFTER (Signal Forms):
  // ============================================

  // Step 1: Create a signal as the single source of truth for form data
  formModel = signal<RegistrationFormModel>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: '',
    },
    phoneNumbers: [{ type: 'mobile', number: '' }],
    acceptTerms: false,
  });

  // Step 2: Create the form with validation schema
  registrationForm = form(this.formModel, (schema) => {
    // Personal Info
    required(schema.firstName, { message: 'First name is required' });
    minLength(schema.firstName, 2, { message: 'First name must be at least 2 characters' });

    required(schema.lastName, { message: 'Last name is required' });
    minLength(schema.lastName, 2, { message: 'Last name must be at least 2 characters' });

    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Please enter a valid email address' });

    // Password with pattern for basic strength validation
    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 8, { message: 'Password must be at least 8 characters' });
    pattern(schema.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain uppercase, lowercase and number',
    });

    required(schema.confirmPassword, { message: 'Please confirm your password' });

    // Nested Address - access nested fields directly
    required(schema.address.street, { message: 'Street is required' });
    required(schema.address.city, { message: 'City is required' });
    required(schema.address.postalCode, { message: 'Postal code is required' });
    pattern(schema.address.postalCode, /^\d{5}$/, { message: 'Postal code must be 5 digits' });
    required(schema.address.country, { message: 'Country is required' });

    // Note: Array items are validated individually via formField bindings
  });

  // Step 3: Computed signals for additional validations
  // (Cross-field validation, complex validation logic)

  // Password match validation
  passwordsMatch = computed(() => {
    const model = this.formModel();
    if (!model.password || !model.confirmPassword) return true;
    return model.password === model.confirmPassword;
  });

  // Detailed password strength feedback
  passwordStrength = computed(() => {
    const password = this.formModel().password;
    if (!password) return { valid: true, errors: [] as string[] };

    const errors: string[] = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('one special character');
    }

    return { valid: errors.length === 0, errors };
  });

  // Terms acceptance check
  termsAccepted = computed(() => this.formModel().acceptTerms === true);

  // Overall form validity
  isFormValid = computed(
    () => this.registrationForm().valid() && this.passwordsMatch() && this.termsAccepted()
  );

  // UI state
  submitted = signal(false);
  submittedData = signal<RegistrationFormModel | null>(null);

  // Data
  phoneTypes: PhoneNumber['type'][] = ['home', 'work', 'mobile'];
  countries = ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'Belgium'];

  // ============================================
  // Array Operations
  // ============================================
  // BEFORE: this.phoneNumbers.push(this.createPhoneNumberGroup());
  // AFTER:  Update the signal directly

  addPhoneNumber(): void {
    this.formModel.update((model) => ({
      ...model,
      phoneNumbers: [...model.phoneNumbers, { type: 'mobile', number: '' }],
    }));
  }

  removePhoneNumber(index: number): void {
    if (this.formModel().phoneNumbers.length > 1) {
      this.formModel.update((model) => ({
        ...model,
        phoneNumbers: model.phoneNumbers.filter((_, i) => i !== index),
      }));
    }
  }

  // ============================================
  // Phone Validation Helper
  // ============================================
  isPhoneNumberValid(number: string): boolean {
    return /^\+?[\d\s-]{6,}$/.test(number);
  }

  // ============================================
  // Submit Handler
  // ============================================
  // BEFORE:
  // if (this.registrationForm.valid) {
  //   this.submittedData = this.registrationForm.value;
  // } else {
  //   this.registrationForm.markAllAsTouched();
  // }

  // AFTER: Using submit() function
  async onSubmit(): Promise<void> {
    // Check additional validations first
    if (!this.passwordsMatch()) {
      console.warn('Passwords do not match');
      return;
    }
    if (!this.termsAccepted()) {
      console.warn('Terms not accepted');
      return;
    }

    await submit(this.registrationForm, async (form) => {
      try {
        const data = form().value();
        console.log('Form submitted:', data);

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

  // ============================================
  // Reset Handler
  // ============================================
  // BEFORE: this.registrationForm.reset({...}); + FormArray manipulation

  // AFTER: Simply reset the signal
  onReset(): void {
    this.formModel.set({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
      phoneNumbers: [{ type: 'mobile', number: '' }],
      acceptTerms: false,
    });
    this.submitted.set(false);
    this.submittedData.set(null);
  }
}
