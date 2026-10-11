// Solution for Exercise 02: Reactive Form → Signal Forms (partial migration with compatForm)
//
// Not every control can be migrated at once: the password control uses a hand-written
// ValidatorFn that we want to keep for now. compatForm() lets us nest the existing FormControl
// inside the model signal and migrate everything else to Signal Forms rules (top-down migration).

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import {
  FormField,
  FormRoot,
  ValidationError,
  apply,
  applyEach,
  email,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { CompatValidationError, compatForm, extractValue } from '@angular/forms/signals/compat';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { PhoneNumber, RegistrationFormModel } from '@app/models/forms.models';
import { addressSchema } from './address.schema';

// ============================================
// Kept from the Reactive Form: custom ValidatorFn for the password strength.
// (In a later, bottom-up step this could become a validate() rule or a SignalFormControl.)
// ============================================
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null;

  const missing: string[] = [];
  if (value.length < 8) missing.push('at least 8 characters');
  if (!/[A-Z]/.test(value)) missing.push('one uppercase letter');
  if (!/[a-z]/.test(value)) missing.push('one lowercase letter');
  if (!/[0-9]/.test(value)) missing.push('one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) missing.push('one special character');

  return missing.length > 0 ? { passwordStrength: { missing } } : null;
}

// The model is plain data, except `password`, which is still a FormControl.
type RegistrationModel = Omit<RegistrationFormModel, 'password'> & {
  password: FormControl<string>;
};

const INITIAL_VALUE: Omit<RegistrationModel, 'password'> = {
  firstName: '',
  lastName: '',
  email: '',
  confirmPassword: '',
  address: { street: '', city: '', postalCode: '', country: '' },
  phoneNumbers: [{ type: 'mobile', number: '' }],
  acceptTerms: false,
};

const PHONE_PATTERN = /^\+?[\d\s-]{6,}$/;

@Component({
  selector: 'app-reactive-form-solution',
  templateUrl: './reactive-form-solution.component.html',
  styleUrl: './reactive-form-solution.component.scss',
  imports: [
    FormField,
    FormRoot,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
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
  //   ...
  //   password: ['', [Validators.required, passwordStrengthValidator]],
  //   address: this.fb.group({ ... }),
  //   phoneNumbers: this.fb.array([...]),
  //   acceptTerms: [false, [Validators.requiredTrue]],
  // }, { validators: [passwordMatchValidator] });

  // ============================================
  // AFTER (Signal Forms + compatForm):
  // ============================================

  // Step 1: Keep the control that is not migrated yet
  private readonly passwordControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, passwordStrengthValidator],
  });

  // Step 2: The model signal. The FormControl is nested as a leaf.
  readonly formModel = signal<RegistrationModel>({
    ...INITIAL_VALUE,
    password: this.passwordControl,
  });

  readonly submittedData = signal<RegistrationFormModel | null>(null);

  // Step 3: compatForm() instead of form(). Rules only for the migrated fields.
  readonly registrationForm = compatForm(
    this.formModel,
    (path) => {
      // Personal Info
      required(path.firstName, { message: 'First name is required' });
      minLength(path.firstName, 2, { message: 'First name must be at least 2 characters' });

      required(path.lastName, { message: 'Last name is required' });
      minLength(path.lastName, 2, { message: 'Last name must be at least 2 characters' });

      required(path.email, { message: 'Email is required' });
      email(path.email, { message: 'Please enter a valid email address' });

      // Password: no rules here, the FormControl validates itself (path.password is a compat path).

      // Cross-field rule: confirmPassword must match the password.
      // valueOf() works for compat paths too and returns the FormControl's value.
      // BEFORE: group-level validator passwordMatchValidator
      required(path.confirmPassword, { message: 'Please confirm your password' });
      validate(path.confirmPassword, ({ value, valueOf }) =>
        value() && value() !== valueOf(path.password)
          ? { kind: 'passwordMismatch', message: 'Passwords do not match' }
          : null,
      );

      // Nested object: reuse a schema
      // BEFORE: address: this.fb.group({ ... })
      apply(path.address, addressSchema);

      // Array: rules per item
      // BEFORE: this.fb.array([...]) with validators in createPhoneNumberGroup()
      applyEach(path.phoneNumbers, (phone) => {
        required(phone.number, { message: 'Phone number is required' });
        pattern(phone.number, PHONE_PATTERN, { message: 'Invalid phone number format' });
      });

      // BEFORE: Validators.requiredTrue - required() treats `false` as empty
      required(path.acceptTerms, { message: 'You must accept the terms' });
    },
    {
      submission: {
        action: async () => {
          await this.fakeApiCall();
          // extractValue() unwraps nested FormControls/FormGroups into plain values
          const data = extractValue(this.registrationForm);
          this.submittedData.set(data);
          console.log('Form submitted:', data);
        },
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  // Plain value for display/debugging (the raw model contains the FormControl object)
  readonly formValue = computed(() => extractValue(this.registrationForm));

  // Data
  readonly phoneTypes: PhoneNumber['type'][] = ['home', 'work', 'mobile'];
  readonly countries = ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'Belgium'];

  // ============================================
  // Array Operations
  // ============================================
  // BEFORE: this.phoneNumbers.push(this.createPhoneNumberGroup()) / removeAt(index)
  // AFTER:  immutable update of the model signal

  addPhoneNumber(): void {
    this.formModel.update((model) => ({
      ...model,
      phoneNumbers: [...model.phoneNumbers, { type: 'mobile', number: '' }],
    }));
  }

  removePhoneNumber(index: number): void {
    this.formModel.update((model) => ({
      ...model,
      phoneNumbers: model.phoneNumbers.filter((_, i) => i !== index),
    }));
  }

  // Errors from a FormControl arrive as CompatValidationError: `kind` is the Reactive Forms error
  // key and `context` is the error value. They carry no message, so we map them here.
  passwordErrorMessage(error: ValidationError): string {
    switch (error.kind) {
      case 'required':
        return 'Password is required';
      case 'passwordStrength': {
        const { missing } = (error as CompatValidationError<{ missing: string[] }>).context;
        return `Password must contain: ${missing.join(', ')}`;
      }
      default:
        return 'Invalid password';
    }
  }

  onReset(): void {
    this.formModel.set({ ...INITIAL_VALUE, password: this.passwordControl });
    this.passwordControl.reset('');
    this.registrationForm().reset();
    this.submittedData.set(null);
  }

  private fakeApiCall(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
}
