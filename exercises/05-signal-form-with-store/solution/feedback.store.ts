// Bonus for Exercise 05: a "create" scenario. The store collects submitted feedback entries.

import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';

export interface FeedbackModel {
  name: string;
  email: string;
  rating: number | null;
  comment: string;
}

export interface FeedbackEntry extends FeedbackModel {
  submittedAt: Date;
}

interface FeedbackState {
  entries: FeedbackEntry[];
  submitting: boolean;
}

export const FeedbackStore = signalStore(
  withState<FeedbackState>({ entries: [], submitting: false }),

  withComputed(({ entries }) => ({
    count: computed(() => entries().length),
    averageRating: computed(() => {
      const ratings = entries()
        .map((e) => e.rating)
        .filter((r): r is number => r !== null);
      return ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    }),
  })),

  withMethods((store) => ({
    // Simulates a POST /api/feedback
    async submitFeedback(feedback: FeedbackModel): Promise<void> {
      patchState(store, { submitting: true });
      await new Promise((resolve) => setTimeout(resolve, 500));
      patchState(store, (state) => ({
        entries: [{ ...feedback, submittedAt: new Date() }, ...state.entries],
        submitting: false,
      }));
    },
  })),
);
