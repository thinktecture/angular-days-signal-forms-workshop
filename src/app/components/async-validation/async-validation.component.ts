// This component is used in Exercise 06
// Files: signal-forms-workshop/exercises/06-async-validation/*

import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserProfileModel } from '../../models/forms.models';
import { MockUserService } from './mock-user.service';

// Async validator factory: Username availability
function usernameAvailabilityValidator(userService: MockUserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }

    return timer(300).pipe(
      // Debounce: wait 300ms before making request
      switchMap(() => userService.checkUsernameAvailability(control.value)),
      map((isAvailable) => (isAvailable ? null : { usernameTaken: true })),
      catchError(() => of({ serverError: true }))
    );
  };
}

// Async validator factory: Email availability
function emailAvailabilityValidator(userService: MockUserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || !control.value.includes('@')) {
      return of(null);
    }

    return timer(300).pipe(
      // Debounce
      switchMap(() => userService.checkEmailAvailability(control.value)),
      map((isAvailable) => (isAvailable ? null : { emailTaken: true })),
      catchError(() => of({ serverError: true }))
    );
  };
}

// Async validator factory: Promo code validation
function promoCodeValidator(userService: MockUserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(300).pipe(
      // Debounce
      switchMap(() => userService.validatePromoCode(control.value)),
      map((result) => (result.valid ? null : { invalidPromoCode: true })),
      catchError(() => of({ serverError: true }))
    );
  };
}

@Component({
  selector: 'app-async-validation',
  templateUrl: './async-validation.component.html',
  styleUrl: './async-validation.component.scss',
  imports: [ReactiveFormsModule, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncValidationComponent {
  // Exercise 06: Convert this reactive form with async validation to Signal Forms
  // See: signal-forms-workshop/exercises/06-async-validation/README.md

  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private userService = inject(MockUserService);

  // Signal to track validation status for UI feedback
  usernameStatus = signal<'idle' | 'checking' | 'available' | 'taken'>('idle');
  emailStatus = signal<'idle' | 'checking' | 'available' | 'taken'>('idle');
  promoCodeStatus = signal<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  promoDiscount = signal<number | null>(null);

  // Bio character count (demonstrates debounced computed value)
  bioCharCount = signal(0);
  bioWordCount = signal(0);

  profileForm: FormGroup = this.fb.group({
    username: [
      '',
      [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)],
      [usernameAvailabilityValidator(this.userService)],
    ],
    email: ['', [Validators.required, Validators.email], [emailAvailabilityValidator(this.userService)]],
    promoCode: ['', [], [promoCodeValidator(this.userService)]],
    displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    bio: ['', [Validators.maxLength(500)]],
  });

  submitted = false;
  submittedData: UserProfileModel | null = null;

  constructor() {
    // Watch username status changes
    this.profileForm
      .get('username')
      ?.statusChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        if (status === 'PENDING') {
          this.usernameStatus.set('checking');
        } else if (status === 'VALID') {
          this.usernameStatus.set(this.profileForm.get('username')?.value ? 'available' : 'idle');
        } else if (status === 'INVALID' && this.profileForm.get('username')?.errors?.['usernameTaken']) {
          this.usernameStatus.set('taken');
        } else {
          this.usernameStatus.set('idle');
        }
      });

    // Watch email status changes
    this.profileForm
      .get('email')
      ?.statusChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        if (status === 'PENDING') {
          this.emailStatus.set('checking');
        } else if (status === 'VALID') {
          this.emailStatus.set(this.profileForm.get('email')?.value ? 'available' : 'idle');
        } else if (status === 'INVALID' && this.profileForm.get('email')?.errors?.['emailTaken']) {
          this.emailStatus.set('taken');
        } else {
          this.emailStatus.set('idle');
        }
      });

    // Watch promo code status changes
    this.profileForm
      .get('promoCode')
      ?.statusChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        const promoValue = this.profileForm.get('promoCode')?.value;
        if (status === 'PENDING') {
          this.promoCodeStatus.set('checking');
          this.promoDiscount.set(null);
        } else if (status === 'VALID' && promoValue) {
          this.promoCodeStatus.set('valid');
          // Re-validate to get discount (in real app, you'd store this differently)
          this.userService.validatePromoCode(promoValue).subscribe((result) => {
            if (result.valid) {
              this.promoDiscount.set(result.discount ?? null);
            }
          });
        } else if (status === 'INVALID' && this.profileForm.get('promoCode')?.errors?.['invalidPromoCode']) {
          this.promoCodeStatus.set('invalid');
          this.promoDiscount.set(null);
        } else {
          this.promoCodeStatus.set('idle');
          this.promoDiscount.set(null);
        }
      });

    // Watch bio changes for character/word count (debounced in real app)
    this.profileForm
      .get('bio')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.bioCharCount.set(value?.length ?? 0);
        this.bioWordCount.set(value ? value.trim().split(/\s+/).filter(Boolean).length : 0);
      });
  }

  // Helper: Check if a control has errors and is touched
  hasError(controlPath: string): boolean {
    const control = this.profileForm.get(controlPath);
    return control ? control.invalid && control.touched : false;
  }

  // Helper: Get error message for a control
  getErrorMessage(controlPath: string): string {
    const control = this.profileForm.get(controlPath);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
    if (errors['email']) return 'Please enter a valid email';
    if (errors['pattern']) return 'Only letters, numbers, and underscores allowed';
    if (errors['usernameTaken']) return 'This username is already taken';
    if (errors['emailTaken']) return 'This email is already registered';
    if (errors['invalidPromoCode']) return 'Invalid promo code';
    if (errors['serverError']) return 'Server error, please try again';

    return 'Invalid value';
  }

  // Check if control is pending (async validation in progress)
  isPending(controlPath: string): boolean {
    const control = this.profileForm.get(controlPath);
    return control?.pending ?? false;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.submitted = true;
      this.submittedData = this.profileForm.value as UserProfileModel;
      console.log('Profile submitted:', this.submittedData);
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  onReset(): void {
    this.profileForm.reset({
      username: '',
      email: '',
      promoCode: '',
      displayName: '',
      bio: '',
    });

    this.usernameStatus.set('idle');
    this.emailStatus.set('idle');
    this.promoCodeStatus.set('idle');
    this.promoDiscount.set(null);
    this.bioCharCount.set(0);
    this.bioWordCount.set(0);

    this.submitted = false;
    this.submittedData = null;
  }
}
