// This component is used in Exercise 05: Signal Form with NgRx SignalStore
// See: exercises/05-signal-form-with-store/README.md
//
// The store (contact-profile.store.ts) is complete. Your task: connect a Signal Form to it.
// Pattern: store delivers data → linkedSignal() model → form() → submission writes back to the store

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ContactProfileStore } from './contact-profile.store';

// TODO 1: Import linkedSignal from @angular/core and
//         FormField, FormRoot, form, required, email, maxLength from @angular/forms/signals

@Component({
  selector: 'app-store-form',
  templateUrl: './store-form.component.html',
  styleUrl: './store-form.component.scss',
  imports: [
    DatePipe,
    // TODO 1: Add FormField and FormRoot
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
export class StoreFormComponent {
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(ContactProfileStore);

  // TODO 2: Create the form model with linkedSignal(() => this.store.profile())
  //         It follows the store (e.g. after a save or a remote update) but stays writable.

  // TODO 3: Create the form with validation rules:
  //         firstName/lastName required, email required + email(), bio maxLength(500)

  // TODO 4: Add a submission action that saves the model through the store:
  //         await this.store.saveProfile(field().value()); then field().reset() and show a snack bar

  // TODO 5: Implement reset: this.profileForm().reset(this.store.profile())
  resetForm(): void {}
}
