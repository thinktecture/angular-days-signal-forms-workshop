// Exercise 06: Async Validation with Signal Forms
// This is the starting point. Your task is to convert the Reactive Form to Signal Forms
// using validateAsync() with debouncing.
//
// Steps:
// 1. Import Signal Forms: form, FormField, required, email, minLength, maxLength, pattern, validateAsync, debounce
// 2. Create a signal-based model with all form fields
// 3. Use debounce() for the field, then validateAsync() with params/factory/onSuccess/onError
// 4. Use computed signals for bio character/word count
// 5. Use the pending() signal for loading state indicators
// 6. Remove all RxJS-based async validators and status subscriptions

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  resource,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
// TODO: Import Signal Forms API
// import {
//   FormField,
//   form,
//   required,
//   email,
//   minLength,
//   maxLength,
//   pattern,
//   validateAsync,
//   debounce,
// } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

import { UserProfileModel } from '../../../../src/app/models/forms.models';
import { MockUserService } from '../../../../src/app/components/async-validation/mock-user.service';

@Component({
  selector: 'app-async-validation-exercise',
  templateUrl: './async-validation.component.html',
  styleUrl: './async-validation.component.scss',
  imports: [
    // TODO: Add FormField to imports
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncValidationExerciseComponent {
  private readonly userService = inject(MockUserService);

  // TODO: Step 1 - Create a signal-based model (source of truth)
  // Hint: Initialize with default values for all fields
  //
  // readonly formModel = signal<UserProfileModel>({
  //   username: '',
  //   email: '',
  //   promoCode: '',
  //   displayName: '',
  //   bio: '',
  // });

  // TODO: Step 2 - Create the Signal Form with async validation schema
  //
  // readonly profileForm = form(this.formModel, (schema) => {
  //   // ========================================
  //   // Username: Sync + Async Validation
  //   // ========================================
  //   required(schema.username, { message: 'Username is required' });
  //   minLength(schema.username, 3, { message: 'Minimum 3 characters' });
  //   pattern(schema.username, /^[a-zA-Z0-9_]+$/, {
  //     message: 'Only letters, numbers, and underscores allowed',
  //   });
  //
  //   // Debounce: Wait 300ms after user stops typing
  //   debounce(schema.username, 300);
  //
  //   // Async validator using validateAsync with resource
  //   // Note: factory receives Signal<TParams | undefined>, not raw value
  //   validateAsync(schema.username, {
  //     // params: Return undefined to skip validation
  //     params: ({ value }) => {
  //       const val = value();
  //       if (!val || val.length < 3) return undefined;
  //       return val;
  //     },
  //     // factory: params is already a Signal<string | undefined>
  //     factory: (usernameSignal) =>
  //       resource({
  //         params: usernameSignal,
  //         loader: async ({ params }) => {
  //           if (!params) return undefined;
  //           const isAvailable = await this.checkUsernameAvailability(params);
  //           return isAvailable;
  //         },
  //       }),
  //     // onSuccess: Return error object { kind, message } or null
  //     onSuccess: (isAvailable) => {
  //       if (isAvailable === false) {
  //         return { kind: 'username_taken', message: 'This username is already taken' };
  //       }
  //       return null;
  //     },
  //     // onError: Handle any errors during validation
  //     onError: () => {
  //       return { kind: 'server_error', message: 'Could not check username availability' };
  //     },
  //   });
  //
  //   // ========================================
  //   // Email: Sync + Async Validation
  //   // ========================================
  //   required(schema.email, { message: 'Email is required' });
  //   email(schema.email, { message: 'Please enter a valid email' });
  //
  //   debounce(schema.email, 300);
  //
  //   validateAsync(schema.email, {
  //     params: ({ value }) => {
  //       const val = value();
  //       if (!val || !val.includes('@')) return undefined;
  //       return val;
  //     },
  //     factory: (emailSignal) =>
  //       resource({
  //         params: emailSignal,
  //         loader: async ({ params }) => {
  //           if (!params) return undefined;
  //           const isAvailable = await this.checkEmailAvailability(params);
  //           return isAvailable;
  //         },
  //       }),
  //     onSuccess: (isAvailable) => {
  //       if (isAvailable === false) {
  //         return { kind: 'email_taken', message: 'This email is already registered' };
  //       }
  //       return null;
  //     },
  //     onError: () => {
  //       return { kind: 'server_error', message: 'Could not check email availability' };
  //     },
  //   });
  //
  //   // ========================================
  //   // Promo Code: Async-only Validation (optional field)
  //   // ========================================
  //   debounce(schema.promoCode, 300);
  //
  //   validateAsync(schema.promoCode, {
  //     params: ({ value }) => {
  //       const val = value();
  //       if (!val) {
  //         this.promoDiscount.set(null);
  //         return undefined;  // Optional field
  //       }
  //       return val;
  //     },
  //     factory: (codeSignal) =>
  //       resource({
  //         params: codeSignal,
  //         loader: async ({ params }) => {
  //           if (!params) return undefined;
  //           const result = await this.validatePromoCode(params);
  //           return result;
  //         },
  //       }),
  //     onSuccess: (result) => {
  //       if (!result) return null;
  //       if (result.valid) {
  //         this.promoDiscount.set(result.discount ?? null);
  //         return null;
  //       }
  //       this.promoDiscount.set(null);
  //       return { kind: 'invalid_promo', message: 'Invalid promo code' };
  //     },
  //     onError: () => {
  //       this.promoDiscount.set(null);
  //       return { kind: 'server_error', message: 'Could not validate promo code' };
  //     },
  //   });
  //
  //   // ========================================
  //   // Display Name: Sync-only Validation
  //   // ========================================
  //   required(schema.displayName, { message: 'Display name is required' });
  //   minLength(schema.displayName, 2, { message: 'Minimum 2 characters' });
  //   maxLength(schema.displayName, 50, { message: 'Maximum 50 characters' });
  //
  //   // ========================================
  //   // Bio: Sync-only Validation
  //   // ========================================
  //   maxLength(schema.bio, 500, { message: 'Maximum 500 characters' });
  // });

  // Signal to track promo code discount (updated by async validator)
  readonly promoDiscount = signal<number | null>(null);

  // TODO: Step 3 - Create computed signals for bio stats
  // Hint: These derive from formModel() without debouncing
  //
  // readonly bioCharCount = computed(() => this.formModel().bio?.length ?? 0);
  // readonly bioWordCount = computed(() => {
  //   const bio = this.formModel().bio;
  //   return bio ? bio.trim().split(/\s+/).filter(Boolean).length : 0;
  // });

  // State
  readonly submitted = signal(false);
  readonly submittedData = signal<UserProfileModel | null>(null);

  // TODO: Step 4 - Create computed for form validity
  // Note: Use pending() not validating() for async validation status
  //
  // readonly isFormValid = computed(() => this.profileForm().valid());
  // readonly isValidating = computed(() => this.profileForm().pending());

  // ========================================
  // Service Methods (convert Observable to Promise)
  // ========================================

  // TODO: Step 5 - Implement async service methods
  // Hint: Use firstValueFrom() to convert Observable to Promise
  //
  // private async checkUsernameAvailability(username: string): Promise<boolean> {
  //   return firstValueFrom(this.userService.checkUsernameAvailability(username));
  // }
  //
  // private async checkEmailAvailability(email: string): Promise<boolean> {
  //   return firstValueFrom(this.userService.checkEmailAvailability(email));
  // }
  //
  // private async validatePromoCode(code: string): Promise<{ valid: boolean; discount?: number }> {
  //   return firstValueFrom(this.userService.validatePromoCode(code));
  // }

  // ========================================
  // Form Actions
  // ========================================

  // TODO: Step 6 - Implement submit handler
  // Hint: Check if form is valid and not pending before submitting
  //
  // onSubmit(): void {
  //   if (this.profileForm().valid() && !this.profileForm().pending()) {
  //     this.submitted.set(true);
  //     this.submittedData.set({ ...this.formModel() });
  //     console.log('Profile submitted:', this.submittedData());
  //   } else {
  //     console.log('Form is invalid or still validating');
  //   }
  // }

  // TODO: Step 7 - Implement reset handler
  //
  // onReset(): void {
  //   this.formModel.set({
  //     username: '',
  //     email: '',
  //     promoCode: '',
  //     displayName: '',
  //     bio: '',
  //   });
  //   this.promoDiscount.set(null);
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
