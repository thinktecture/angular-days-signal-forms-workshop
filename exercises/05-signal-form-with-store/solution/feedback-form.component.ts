import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  linkedSignal,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  FormField,
  form,
  required,
  email,
  maxLength,
  minLength,
} from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeedbackStore } from './feedback.store';

@Component({
  selector: 'app-feedback-form-solution',
  templateUrl: './feedback-form.component.html',
  styleUrl: './feedback-form.component.scss',
  imports: [
    JsonPipe,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  providers: [FeedbackStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackFormSolutionComponent {
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(FeedbackStore);

  // Rating options for select
  readonly ratingOptions = [
    { value: 1, label: '⭐ Poor' },
    { value: 2, label: '⭐⭐ Fair' },
    { value: 3, label: '⭐⭐⭐ Good' },
    { value: 4, label: '⭐⭐⭐⭐ Very Good' },
    { value: 5, label: '⭐⭐⭐⭐⭐ Excellent' },
  ];

  // linkedSignal creates a writable signal that derives its initial value from the store
  // When the store changes, the form model updates automatically
  readonly feedbackModel = linkedSignal(() => this.store.feedback());

  // Create Signal Form with validation schema
  readonly feedbackForm = form(this.feedbackModel, (schema) => {
    required(schema.name, { message: 'Name is required' });
    minLength(schema.name, 2, { message: 'Name must be at least 2 characters' });
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Please enter a valid email address' });
    required(schema.rating, { message: 'Please select a rating' });
    maxLength(schema.comment, 500, { message: 'Comment cannot exceed 500 characters' });
  });

  constructor() {
    // Sync form model changes back to the store
    effect(() => {
      const formValue = this.feedbackModel();
      const storeValue = this.store.feedback();

      // Only update store if values differ (avoid circular updates)
      if (JSON.stringify(formValue) !== JSON.stringify(storeValue)) {
        this.store.setFeedback(formValue);
      }
    });

    // Show success message when submitted
    effect(() => {
      const submittedAt = this.store.submittedAt();
      if (submittedAt) {
        this.snackBar.open('Feedback submitted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      }
    });
  }

  submitFeedback(): void {
    if (this.feedbackForm().valid()) {
      this.store.submitFeedback();
    }
  }

  resetForm(): void {
    this.store.reset();
    // linkedSignal will automatically update feedbackModel from store
  }
}
