// Exercise 02: Reactive Form → Signal Forms
// This is the starting point. Your task is to migrate this component to use Signal Forms.
//
// Steps:
// 1. Replace ReactiveFormsModule with FormField from @angular/forms/signals
// 2. Convert FormBuilder-based form to a signal-based model
// 3. Create a form with validation schema using form()
// 4. Replace formControlName with [formField] in the template
// 5. Replace nested formGroupName with direct access (form.address.street)
// 6. Replace FormArray with signal array + update()
// 7. Use computed signals for cross-field validation (password match)

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
import { RegistrationFormModel, PhoneNumber } from '../../../../src/app/models/forms.models';

// TODO: Replace imports with Signal Forms
// import { signal, computed } from '@angular/core';
// import { FormField, form, submit, required, email, minLength, pattern } from '@angular/forms/signals';

// Custom Validator: Password strength (TO BE REPLACED with computed signal)
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

// Cross-field Validator (TO BE REPLACED with computed signal)
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reactive-form-exercise',
  templateUrl: './reactive-form.component.html',
  styleUrl: './reactive-form.component.scss',
  imports: [
    ReactiveFormsModule, // TODO: Replace with FormField
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
export class ReactiveFormExerciseComponent {
  private fb = inject(FormBuilder);

  // TODO: Replace FormBuilder with signal-based model
  // BEFORE:
  registrationForm: FormGroup = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        country: ['', [Validators.required]],
      }),
      phoneNumbers: this.fb.array([this.createPhoneNumberGroup()]),
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    {
      validators: [passwordMatchValidator],
    }
  );

  // AFTER:
  // formModel = signal<RegistrationFormModel>({
  //   firstName: '',
  //   lastName: '',
  //   email: '',
  //   password: '',
  //   confirmPassword: '',
  //   address: {
  //     street: '',
  //     city: '',
  //     postalCode: '',
  //     country: '',
  //   },
  //   phoneNumbers: [{ type: 'mobile', number: '' }],
  //   acceptTerms: false,
  // });

  // TODO: Create form with validation schema
  // registrationForm = form(this.formModel, (schema) => {
  //   required(schema.firstName, { message: 'First name is required' });
  //   minLength(schema.firstName, 2, { message: 'First name must be at least 2 characters' });
  //   // ... more validators
  // });

  // TODO: Add computed signals for cross-field validation
  // passwordsMatch = computed(() => {
  //   const model = this.formModel();
  //   if (!model.password || !model.confirmPassword) return true;
  //   return model.password === model.confirmPassword;
  // });
  //
  // passwordStrength = computed(() => {
  //   const password = this.formModel().password;
  //   if (!password) return { valid: true, errors: [] as string[] };
  //   // ... validation logic
  // });
  //
  // termsAccepted = computed(() => this.formModel().acceptTerms === true);
  //
  // isFormValid = computed(() =>
  //   this.registrationForm().valid() && this.passwordsMatch() && this.termsAccepted()
  // );

  submitted = false;
  submittedData: RegistrationFormModel | null = null;

  get phoneNumbers(): FormArray {
    return this.registrationForm.get('phoneNumbers') as FormArray;
  }

  get addressGroup(): FormGroup {
    return this.registrationForm.get('address') as FormGroup;
  }

  phoneTypes: PhoneNumber['type'][] = ['home', 'work', 'mobile'];
  countries = ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'Belgium'];

  private createPhoneNumberGroup(): FormGroup {
    return this.fb.group({
      type: ['mobile', [Validators.required]],
      number: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{6,}$/)]],
    });
  }

  // TODO: Replace with signal.update()
  // BEFORE:
  addPhoneNumber(): void {
    this.phoneNumbers.push(this.createPhoneNumberGroup());
  }
  // AFTER:
  // addPhoneNumber(): void {
  //   this.formModel.update((model) => ({
  //     ...model,
  //     phoneNumbers: [...model.phoneNumbers, { type: 'mobile', number: '' }],
  //   }));
  // }

  // TODO: Replace with signal.update()
  // BEFORE:
  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }
  // AFTER:
  // removePhoneNumber(index: number): void {
  //   if (this.formModel().phoneNumbers.length > 1) {
  //     this.formModel.update((model) => ({
  //       ...model,
  //       phoneNumbers: model.phoneNumbers.filter((_, i) => i !== index),
  //     }));
  //   }
  // }

  onSubmit(): void {
    // TODO: Replace with submit() function
    // BEFORE:
    if (this.registrationForm.valid) {
      this.submitted = true;
      this.submittedData = this.registrationForm.value as RegistrationFormModel;
      console.log('Form submitted:', this.submittedData);
    } else {
      this.registrationForm.markAllAsTouched();
    }
    // AFTER:
    // await submit(this.registrationForm, async (form) => {
    //   try {
    //     this.submitted.set(true);
    //     this.submittedData.set({ ...this.formModel() });
    //     return null;
    //   } catch (error) {
    //     return { kind: 'processing_error' as const, error: String(error) };
    //   }
    // });
  }

  onReset(): void {
    // TODO: Replace with signal.set()
    // BEFORE:
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

    while (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(1);
    }
    this.phoneNumbers.at(0).reset({ type: 'mobile', number: '' });

    this.submitted = false;
    this.submittedData = null;
    // AFTER:
    // this.formModel.set({ ... initial values ... });
    // this.submitted.set(false);
    // this.submittedData.set(null);
  }

  hasError(controlPath: string): boolean {
    const control = this.registrationForm.get(controlPath);
    return control ? control.invalid && control.touched : false;
  }

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
