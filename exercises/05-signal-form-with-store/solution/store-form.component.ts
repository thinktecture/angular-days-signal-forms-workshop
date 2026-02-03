import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  linkedSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormField, form, required, email, maxLength } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
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

  // linkedSignal creates a writable signal that derives its initial value from the store
  // When the store changes, the form model updates automatically
  readonly profileModel = linkedSignal(() => this.store.profile());

  // Create Signal Form with validation schema
  readonly profileForm = form(this.profileModel, (schema) => {
    required(schema.firstName, { message: 'First name is required' });
    required(schema.lastName, { message: 'Last name is required' });
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Please enter a valid email' });
    maxLength(schema.bio, 500, { message: 'Bio cannot exceed 500 characters' });
  });

  constructor() {
    // Sync form model changes back to the store
    effect(() => {
      const formValue = this.profileModel();
      const storeValue = this.store.profile();

      // Only update store if values differ (avoid circular updates)
      if (JSON.stringify(formValue) !== JSON.stringify(storeValue)) {
        this.store.setProfile(formValue);
      }
    });

    // Show success message when saved
    effect(() => {
      const lastSaved = this.store.lastSaved();
      if (lastSaved) {
        this.snackBar.open('Profile saved successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm().valid()) {
      this.store.saveProfile();
    }
  }

  resetForm(): void {
    this.store.resetToSaved();
    // linkedSignal will automatically update profileModel from store
  }
}
