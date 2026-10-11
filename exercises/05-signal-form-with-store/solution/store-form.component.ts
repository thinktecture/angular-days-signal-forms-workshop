// Solution for Exercise 05: Signal Form with NgRx SignalStore
//
// Pattern A - the store delivers the data:
// 1. linkedSignal() derives the form model from the store and stays writable for user input
// 2. form() wraps the model; no effect() is needed to keep store and form in sync
// 3. The submission action writes the model back to the store
// 4. Store = persisted truth, form = draft. dirty() tells you whether there are unsaved changes.

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { FormField, FormRoot, email, form, maxLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ContactProfileStore } from './contact-profile.store';

@Component({
  selector: 'app-store-form-solution',
  templateUrl: './store-form.component.html',
  styleUrl: './store-form.component.scss',
  imports: [
    DatePipe,
    FormField,
    FormRoot,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [ContactProfileStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreFormSolutionComponent {
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(ContactProfileStore);

  // Step 1: The model follows the store, but user input can overwrite it (writable).
  // When the store emits a new profile (save, reload, remote update) the draft is replaced.
  readonly profileModel = linkedSignal(() => this.store.profile());

  // Step 2: The form wraps the model. No effect(), no valueChanges, no patchValue.
  readonly profileForm = form(
    this.profileModel,
    (path) => {
      required(path.firstName, { message: 'First name is required' });
      required(path.lastName, { message: 'Last name is required' });
      required(path.email, { message: 'Email is required' });
      email(path.email, { message: 'Please enter a valid email' });
      maxLength(path.bio, 500, { message: 'Bio cannot exceed 500 characters' });
    },
    {
      submission: {
        // Step 3: Submit writes back to the store. submitting() is true while saving.
        action: async (field) => {
          await this.store.saveProfile(field().value());
          // The store now holds the saved value → linkedSignal already points to it.
          // Clear the interaction state (dirty/touched) without changing the value.
          field().reset();
          this.snackBar.open('Profile saved successfully!', 'Close', { duration: 3000 });
        },
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  resetForm(): void {
    // Back to the persisted value and clear dirty/touched
    this.profileForm().reset(this.store.profile());
  }
}
