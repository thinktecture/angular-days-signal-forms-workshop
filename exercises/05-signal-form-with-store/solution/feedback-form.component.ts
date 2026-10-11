// Bonus for Exercise 05: Pattern B - the form creates new data.
// There is nothing to load, so the model is a plain signal. The submission action hands the
// value to the store and resets the form for the next entry.

import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  maxLength,
  minLength,
  required,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FeedbackModel, FeedbackStore } from './feedback.store';

const INITIAL_VALUE: FeedbackModel = { name: '', email: '', rating: null, comment: '' };

@Component({
  selector: 'app-feedback-form-solution',
  templateUrl: './feedback-form.component.html',
  styleUrl: './feedback-form.component.scss',
  imports: [
    DatePipe,
    DecimalPipe,
    FormField,
    FormRoot,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [FeedbackStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackFormSolutionComponent {
  private readonly snackBar = inject(MatSnackBar);
  readonly store = inject(FeedbackStore);

  readonly ratingOptions = [
    { value: 1, label: '⭐ Poor' },
    { value: 2, label: '⭐⭐ Fair' },
    { value: 3, label: '⭐⭐⭐ Good' },
    { value: 4, label: '⭐⭐⭐⭐ Very Good' },
    { value: 5, label: '⭐⭐⭐⭐⭐ Excellent' },
  ];

  // Plain signal: the form owns the draft, the store only receives finished entries
  readonly feedbackModel = signal<FeedbackModel>(INITIAL_VALUE);

  readonly feedbackForm = form(
    this.feedbackModel,
    (path) => {
      required(path.name, { message: 'Name is required' });
      minLength(path.name, 2, { message: 'Name must be at least 2 characters' });
      required(path.email, { message: 'Email is required' });
      email(path.email, { message: 'Please enter a valid email address' });
      required(path.rating, { message: 'Please select a rating' });
      maxLength(path.comment, 500, { message: 'Comment cannot exceed 500 characters' });
    },
    {
      submission: {
        action: async (field) => {
          await this.store.submitFeedback(field().value());
          field().reset(INITIAL_VALUE);
          this.snackBar.open('Thank you for your feedback!', 'Close', { duration: 3000 });
        },
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );
}
