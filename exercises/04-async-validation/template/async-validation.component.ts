// This component is used in Exercise 04: Async Validation
// See: exercises/04-async-validation/README.md
//
// The form is already a Signal Form with synchronous rules. Your task: add the async rules.
// Techniques: validateHttp() with the `debounce` option, validateAsync() + rxResource(), pending()

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  maxLength,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserProfileModel } from '@app/models/forms.models';
import { MockUserService } from './mock-user.service';

const INITIAL_VALUE: UserProfileModel = {
  username: '',
  email: '',
  promoCode: '',
  displayName: '',
  bio: '',
};

@Component({
  selector: 'app-async-validation',
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
export class AsyncValidationComponent {
  // Used for the promo code (bonus task). The username/email checks go through HttpClient and
  // are answered by a fake backend (mock-api.interceptor.ts):
  //   GET /api/users/check?username=...  → { available: boolean }
  //   GET /api/emails/check?email=...    → { available: boolean }
  private readonly userService = inject(MockUserService);

  readonly formModel = signal<UserProfileModel>(INITIAL_VALUE);
  readonly submittedData = signal<UserProfileModel | null>(null);

  readonly profileForm = form(
    this.formModel,
    (path) => {
      // ========================================
      // Username: sync rules (done)
      // ========================================
      required(path.username, { message: 'Username is required' });
      minLength(path.username, 3, { message: 'Minimum 3 characters' });
      pattern(path.username, /^[a-zA-Z0-9_]+$/, {
        message: 'Only letters, numbers, and underscores allowed',
      });

      // TODO 1: Check the username availability on the "server"
      //   validateHttp(path.username, {
      //     debounce: 300,                       // throttle only the request, sync rules stay instant
      //     request: ({ value }) => `/api/users/check?username=${encodeURIComponent(value())}`,
      //     onSuccess: (res: { available: boolean }) => ...,  // null = ok, { kind, message } = error
      //     onError: () => ({ kind: 'serverError', message: 'Could not check username' }),
      //   });
      // Taken usernames: taken, admin, user, test, demo

      // ========================================
      // Email: sync rules (done)
      // ========================================
      required(path.email, { message: 'Email is required' });
      email(path.email, { message: 'Please enter a valid email' });

      // TODO 2: Same for the email: GET /api/emails/check?email=...
      // Registered emails: test@example.com, admin@example.com, user@example.com

      // ========================================
      // Promo Code: optional
      // ========================================
      // TODO 3 (bonus): validateAsync() with rxResource() and this.userService.validatePromoCode()
      //   validateAsync(path.promoCode, {
      //     debounce: 300,
      //     params: ({ value }) => value() || undefined,   // undefined = skip validation
      //     factory: (code) => rxResource({ params: code, stream: ({ params }) => ... }),
      //     onSuccess: (result) => ...,
      //     onError: () => ...,
      //   });
      // Valid codes: SAVE10, SAVE20, WELCOME, VIP50

      // ========================================
      // Display Name / Bio: sync rules only (done)
      // ========================================
      required(path.displayName, { message: 'Display name is required' });
      minLength(path.displayName, 2, { message: 'Minimum 2 characters' });
      maxLength(path.displayName, 50, { message: 'Maximum 50 characters' });
      maxLength(path.bio, 500, { message: 'Maximum 500 characters' });
    },
    {
      submission: {
        // TODO 4: Make sure pending async validators block the submission (ignoreValidators)
        action: async (field) => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          this.submittedData.set(field().value());
          console.log('Profile submitted:', field().value());
        },
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

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
