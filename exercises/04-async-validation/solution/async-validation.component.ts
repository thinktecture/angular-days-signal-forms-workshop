// Solution for Exercise 04: Async Validation with Signal Forms
//
// - validateHttp():  HTTP request via httpResource, `debounce` throttles only this request
// - validateAsync(): any Resource (here rxResource + a service returning Observables)
// - Async rules only run once all sync rules of the field pass
// - pending() is true while a request is in flight; valid() and invalid() are both false then
// - ignoreValidators: 'none' makes the submission wait for pending validators

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  FormField,
  FormRoot,
  email,
  form,
  maxLength,
  minLength,
  pattern,
  required,
  validateAsync,
  validateHttp,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MockUserService } from '@app/components/async-validation/mock-user.service';
import { UserProfileModel } from '@app/models/forms.models';

const INITIAL_VALUE: UserProfileModel = {
  username: '',
  email: '',
  promoCode: '',
  displayName: '',
  bio: '',
};

@Component({
  selector: 'app-async-validation-solution',
  templateUrl: './async-validation.component.html',
  styleUrl: './async-validation.component.scss',
  imports: [
    FormField,
    FormRoot,
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

  readonly formModel = signal<UserProfileModel>(INITIAL_VALUE);
  readonly submittedData = signal<UserProfileModel | null>(null);

  readonly profileForm = form(
    this.formModel,
    (path) => {
      // ========================================
      // Username: sync rules + HTTP availability check
      // ========================================
      required(path.username, { message: 'Username is required' });
      minLength(path.username, 3, { message: 'Minimum 3 characters' });
      pattern(path.username, /^[a-zA-Z0-9_]+$/, {
        message: 'Only letters, numbers, and underscores allowed',
      });

      validateHttp(path.username, {
        // Throttle only the request. Sync rules above still react on every keystroke.
        debounce: 300,
        // Returning undefined skips the request (e.g. empty value)
        request: ({ value }) =>
          value() ? `/api/users/check?username=${encodeURIComponent(value())}` : undefined,
        onSuccess: (res: { available: boolean }) =>
          res.available
            ? null
            : { kind: 'usernameTaken', message: 'This username is already taken' },
        onError: () => ({ kind: 'serverError', message: 'Could not check username availability' }),
      });

      // ========================================
      // Email: sync rules + HTTP registration check
      // ========================================
      required(path.email, { message: 'Email is required' });
      email(path.email, { message: 'Please enter a valid email' });

      validateHttp(path.email, {
        debounce: 300,
        request: ({ value }) =>
          value() ? `/api/emails/check?email=${encodeURIComponent(value())}` : undefined,
        onSuccess: (res: { available: boolean }) =>
          res.available
            ? null
            : { kind: 'emailTaken', message: 'This email is already registered' },
        onError: () => ({ kind: 'serverError', message: 'Could not check email availability' }),
      });

      // ========================================
      // Promo Code: optional, validated with a generic Resource (rxResource + Observable service)
      // ========================================
      validateAsync(path.promoCode, {
        debounce: 300,
        // params: what the resource depends on. undefined = nothing to validate.
        params: ({ value }) => value() || undefined,
        // factory: build the resource from the params signal
        factory: (code) =>
          rxResource({
            params: code,
            stream: ({ params }) => this.userService.validatePromoCode(params),
          }),
        onSuccess: (result) =>
          result?.valid === false ? { kind: 'invalidPromo', message: 'Invalid promo code' } : null,
        onError: () => ({ kind: 'serverError', message: 'Could not validate promo code' }),
      });

      // ========================================
      // Display Name / Bio: sync rules only
      // ========================================
      required(path.displayName, { message: 'Display name is required' });
      minLength(path.displayName, 2, { message: 'Minimum 2 characters' });
      maxLength(path.displayName, 50, { message: 'Maximum 50 characters' });
      maxLength(path.bio, 500, { message: 'Maximum 500 characters' });
    },
    {
      submission: {
        // 'pending' (default) would submit while async validators are still running
        ignoreValidators: 'none',
        action: async (field) => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          this.submittedData.set(field().value());
          console.log('Profile submitted:', field().value());
        },
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  // Details of a valid promo code for the UI: a resource that depends on form state
  readonly promoDetails = rxResource({
    params: () =>
      this.profileForm.promoCode().valid() ? this.formModel().promoCode || undefined : undefined,
    stream: ({ params }) => this.userService.validatePromoCode(params),
  });

  // Derived values come straight from the model signal, no valueChanges subscription needed
  readonly bioCharCount = computed(() => this.formModel().bio.length);
  readonly bioWordCount = computed(() => {
    const bio = this.formModel().bio.trim();
    return bio ? bio.split(/\s+/).length : 0;
  });

  onReset(): void {
    this.profileForm().reset(INITIAL_VALUE);
    this.submittedData.set(null);
  }
}
