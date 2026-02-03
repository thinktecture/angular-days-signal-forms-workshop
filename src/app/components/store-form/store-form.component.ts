import { Component, ChangeDetectionStrategy, inject, effect, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ContactProfileStore } from './contact-profile.store';

@Component({
  selector: 'app-store-form',
  templateUrl: './store-form.component.html',
  styleUrl: './store-form.component.scss',
  imports: [
    DatePipe,
    ReactiveFormsModule,
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
export class StoreFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(ContactProfileStore);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    company: [''],
    role: [''],
    bio: ['', Validators.maxLength(500)],
  });

  constructor() {
    // Sync form changes to store
    this.profileForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.store.updateProfile(value);
    });

    // React to store changes and update form
    effect(() => {
      const profile = this.store.profile();
      const currentValue = this.profileForm.getRawValue();

      // Only update form if store value differs (avoid circular updates)
      if (JSON.stringify(profile) !== JSON.stringify(currentValue)) {
        this.profileForm.patchValue(profile, { emitEvent: false });
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

  ngOnInit(): void {
    // Initialize form with store data
    this.profileForm.patchValue(this.store.profile(), { emitEvent: false });
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.store.saveProfile();
    }
  }

  resetForm(): void {
    this.store.resetToSaved();
  }
}
