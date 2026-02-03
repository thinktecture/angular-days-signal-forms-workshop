// Exercise 06 Solution: Async Validation with Signal Forms
// This demonstrates how to use validateAsync() with debouncing

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  resource,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  FormField,
  form,
  required,
  email,
  minLength,
  maxLength,
  pattern,
  validateAsync,
  debounce,
} from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

import { UserProfileModel } from '../../../src/app/models/forms.models';
import { MockUserService } from '../../../src/app/components/async-validation/mock-user.service';

@Component({
  selector: 'app-async-validation-solution',
  templateUrl: './async-validation.component.html',
  styleUrl: './async-validation.component.scss',
  imports: [
    FormField,
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
export class AsyncValidationSolutionComponent {
  private readonly userService = inject(MockUserService);

  // Signal-based model (source of truth)
  readonly formModel = signal<UserProfileModel>({
    username: '',
    email: '',
    promoCode: '',
    displayName: '',
    bio: '',
  });

  // Signal to track promo code discount (updated by async validator)
  readonly promoDiscount = signal<number | null>(null);

  // Create Signal Form with async validation schema
  readonly profileForm = form(this.formModel, (schema) => {
    // ========================================
    // Username: Sync + Async Validation
    // ========================================
    required(schema.username, { message: 'Username is required' });
    minLength(schema.username, 3, { message: 'Minimum 3 characters' });
    pattern(schema.username, /^[a-zA-Z0-9_]+$/, {
      message: 'Only letters, numbers, and underscores allowed',
    });

    // Debounce: Wait 300ms after user stops typing before async validation
    debounce(schema.username, 300);

    // Async validator using validateAsync with resource
    // factory receives Signal<TParams | undefined>, not raw value
    validateAsync(schema.username, {
      // params: Return undefined to skip validation (when value doesn't meet criteria)
      params: ({ value }) => {
        const val = value();
        // Skip if value doesn't pass sync validators
        if (!val || val.length < 3) return undefined;
        return val;
      },
      // factory: params is already a Signal<string | undefined>
      factory: (usernameSignal) =>
        resource({
          params: usernameSignal,
          loader: async ({ params }) => {
            if (!params) return undefined;
            const isAvailable = await this.checkUsernameAvailability(params);
            return isAvailable;
          },
        }),
      // onSuccess: Return error object or null
      onSuccess: (isAvailable) => {
        if (isAvailable === false) {
          return {
            kind: 'username_taken',
            message: 'This username is already taken',
          };
        }
        return null;
      },
      // onError: Handle any errors during validation
      onError: () => {
        return {
          kind: 'server_error',
          message: 'Could not check username availability',
        };
      },
    });

    // ========================================
    // Email: Sync + Async Validation
    // ========================================
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Please enter a valid email' });

    // Debounce email field
    debounce(schema.email, 300);

    // Async email validation
    validateAsync(schema.email, {
      params: ({ value }) => {
        const val = value();
        if (!val || !val.includes('@')) return undefined;
        return val;
      },
      factory: (emailSignal) =>
        resource({
          params: emailSignal,
          loader: async ({ params }) => {
            if (!params) return undefined;
            const isAvailable = await this.checkEmailAvailability(params);
            return isAvailable;
          },
        }),
      onSuccess: (isAvailable) => {
        if (isAvailable === false) {
          return {
            kind: 'email_taken',
            message: 'This email is already registered',
          };
        }
        return null;
      },
      onError: () => {
        return {
          kind: 'server_error',
          message: 'Could not check email availability',
        };
      },
    });

    // ========================================
    // Promo Code: Async-only Validation (optional field)
    // ========================================
    debounce(schema.promoCode, 300);

    validateAsync(schema.promoCode, {
      params: ({ value }) => {
        const val = value();
        // Optional field - skip if empty
        if (!val) {
          this.promoDiscount.set(null);
          return undefined;
        }
        return val;
      },
      factory: (codeSignal) =>
        resource({
          params: codeSignal,
          loader: async ({ params }) => {
            if (!params) return undefined;
            const result = await this.validatePromoCode(params);
            return result;
          },
        }),
      onSuccess: (result) => {
        if (!result) return null;
        if (result.valid) {
          this.promoDiscount.set(result.discount ?? null);
          return null;
        }
        this.promoDiscount.set(null);
        return {
          kind: 'invalid_promo',
          message: 'Invalid promo code',
        };
      },
      onError: () => {
        this.promoDiscount.set(null);
        return {
          kind: 'server_error',
          message: 'Could not validate promo code',
        };
      },
    });

    // ========================================
    // Display Name: Sync-only Validation
    // ========================================
    required(schema.displayName, { message: 'Display name is required' });
    minLength(schema.displayName, 2, { message: 'Minimum 2 characters' });
    maxLength(schema.displayName, 50, { message: 'Maximum 50 characters' });

    // ========================================
    // Bio: Sync-only Validation (with computed stats)
    // ========================================
    maxLength(schema.bio, 500, { message: 'Maximum 500 characters' });
  });

  // Computed signals for bio stats (derive from formModel without debouncing)
  readonly bioCharCount = computed(() => this.formModel().bio?.length ?? 0);
  readonly bioWordCount = computed(() => {
    const bio = this.formModel().bio;
    return bio ? bio.trim().split(/\s+/).filter(Boolean).length : 0;
  });

  // State
  readonly submitted = signal(false);
  readonly submittedData = signal<UserProfileModel | null>(null);

  // Computed for form validity and validation status
  readonly isFormValid = computed(() => this.profileForm().valid());
  readonly isValidating = computed(() => this.profileForm().pending());

  // ========================================
  // Service Methods (convert Observable to Promise)
  // ========================================

  private async checkUsernameAvailability(username: string): Promise<boolean> {
    return firstValueFrom(this.userService.checkUsernameAvailability(username));
  }

  private async checkEmailAvailability(email: string): Promise<boolean> {
    return firstValueFrom(this.userService.checkEmailAvailability(email));
  }

  private async validatePromoCode(
    code: string
  ): Promise<{ valid: boolean; discount?: number }> {
    return firstValueFrom(this.userService.validatePromoCode(code));
  }

  // ========================================
  // Form Actions
  // ========================================

  onSubmit(): void {
    // Check if form is valid and not pending before submitting
    if (this.profileForm().valid() && !this.profileForm().pending()) {
      this.submitted.set(true);
      this.submittedData.set({ ...this.formModel() });
      console.log('Profile submitted:', this.submittedData());
    } else if (this.profileForm().pending()) {
      console.log('Form is still validating, please wait...');
    } else {
      console.log('Form is invalid');
    }
  }

  onReset(): void {
    this.formModel.set({
      username: '',
      email: '',
      promoCode: '',
      displayName: '',
      bio: '',
    });
    this.promoDiscount.set(null);
    this.submitted.set(false);
    this.submittedData.set(null);
  }
}
