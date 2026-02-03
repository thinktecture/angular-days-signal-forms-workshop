// This component is used in Exercise 02
// Files: signal-forms-workshop/exercises/02-reactive-to-signal-form/*

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationFormModel, PhoneNumber } from '../../models/forms.models';

// Custom Validator: Password strength
// Requires: 1 uppercase, 1 lowercase, 1 number, 1 special char, min 8 chars
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
  const hasMinLength = value.length >= 8;

  const errors: string[] = [];
  if (!hasMinLength) errors.push('at least 8 characters');
  if (!hasUpperCase) errors.push('one uppercase letter');
  if (!hasLowerCase) errors.push('one lowercase letter');
  if (!hasNumber) errors.push('one number');
  if (!hasSpecialChar) errors.push('one special character');

  if (errors.length > 0) {
    return { passwordStrength: { missing: errors } };
  }
  return null;
}

// Cross-field Validator: Password confirmation
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reactive-form',
  templateUrl: './reactive-form.component.html',
  styleUrl: './reactive-form.component.scss',
  imports: [
    ReactiveFormsModule,
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
export class ReactiveFormComponent {
  // Exercise 02: Convert this reactive form to Signal Forms
  // See: signal-forms-workshop/exercises/02-reactive-to-signal-form/README.md

  private fb = inject(FormBuilder);

  // The reactive form with nested objects and FormArray
  registrationForm: FormGroup = this.fb.group(
    {
      // Personal Info
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],

      // Password fields (cross-field validation applied at group level)
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],

      // Nested object: Address
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        country: ['', [Validators.required]],
      }),

      // FormArray: Phone numbers
      phoneNumbers: this.fb.array([this.createPhoneNumberGroup()]),

      // Terms
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    {
      validators: [passwordMatchValidator],
    }
  );

  submitted = false;
  submittedData: RegistrationFormModel | null = null;

  // Getter for FormArray
  get phoneNumbers(): FormArray {
    return this.registrationForm.get('phoneNumbers') as FormArray;
  }

  // Getter for nested address group
  get addressGroup(): FormGroup {
    return this.registrationForm.get('address') as FormGroup;
  }

  // Available phone types
  phoneTypes: PhoneNumber['type'][] = ['home', 'work', 'mobile'];

  // Available countries
  countries = ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'Belgium'];

  // Create a new phone number FormGroup
  private createPhoneNumberGroup(): FormGroup {
    return this.fb.group({
      type: ['mobile', [Validators.required]],
      number: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{6,}$/)]],
    });
  }

  // Add phone number to FormArray
  addPhoneNumber(): void {
    this.phoneNumbers.push(this.createPhoneNumberGroup());
  }

  // Remove phone number from FormArray
  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  // Submit handler
  onSubmit(): void {
    if (this.registrationForm.valid) {
      this.submitted = true;
      this.submittedData = this.registrationForm.value as RegistrationFormModel;
      console.log('Form submitted:', this.submittedData);
    } else {
      // Mark all fields as touched to show validation errors
      this.registrationForm.markAllAsTouched();
    }
  }

  // Reset handler
  onReset(): void {
    this.registrationForm.reset({
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
      acceptTerms: false,
    });

    // Reset FormArray to single empty entry
    while (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(1);
    }
    this.phoneNumbers.at(0).reset({ type: 'mobile', number: '' });

    this.submitted = false;
    this.submittedData = null;
  }

  // Helper: Check if a control has errors and is touched
  hasError(controlPath: string): boolean {
    const control = this.registrationForm.get(controlPath);
    return control ? control.invalid && control.touched : false;
  }

  // Helper: Get error message for a control
  getErrorMessage(controlPath: string): string {
    const control = this.registrationForm.get(controlPath);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['email']) return 'Please enter a valid email';
    if (errors['pattern']) return 'Invalid format';
    if (errors['passwordStrength']) {
      return `Password must contain: ${errors['passwordStrength'].missing.join(', ')}`;
    }

    return 'Invalid value';
  }
}
