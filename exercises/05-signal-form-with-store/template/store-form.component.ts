import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// TODO: Import Signal Forms API
// import { FormField } from '@angular/forms/signals';

// TODO: Import your ContactProfileStore
// import { ContactProfileStore } from './signal-form-store';

@Component({
  selector: 'app-store-form-exercise',
  templateUrl: './store-form.component.html',
  styleUrl: './store-form.component.scss',
  imports: [
    DatePipe,
    // TODO: Add FormField from @angular/forms/signals
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  // TODO: Provide your ContactProfileStore
  // providers: [ContactProfileStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreFormExerciseComponent {
  private readonly snackBar = inject(MatSnackBar);

  // TODO: Inject your ContactProfileStore
  // readonly store = inject(ContactProfileStore);

  // TODO: Create a Signal Form that syncs with the store
  // Hint: Use linkedSignal to create a form model that derives from the store
  //
  // Example structure:
  // profileModel = linkedSignal(() => this.store.profile());
  //
  // profileForm = form(this.profileModel, (schema) => {
  //   required(schema.firstName, { message: 'First name is required' });
  //   required(schema.lastName, { message: 'Last name is required' });
  //   required(schema.email, { message: 'Email is required' });
  //   email(schema.email, { message: 'Please enter a valid email' });
  //   maxLength(schema.bio, 500, { message: 'Bio cannot exceed 500 characters' });
  // });

  // TODO: Implement save functionality
  saveProfile(): void {
    // if (this.profileForm().valid()) {
    //   this.store.saveProfile();
    //   this.snackBar.open('Profile saved successfully!', 'Close', {
    //     duration: 3000,
    //   });
    // }
  }

  // TODO: Implement reset functionality
  resetForm(): void {
    // this.store.resetToSaved();
    // Reset form model to match store
  }
}
