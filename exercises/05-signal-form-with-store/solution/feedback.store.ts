import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

// Feedback Form Model
export interface FeedbackModel {
  name: string;
  email: string;
  rating: number | null;
  comment: string;
}

// Initial empty state
export const initialFeedback: FeedbackModel = {
  name: '',
  email: '',
  rating: null,
  comment: '',
};

interface FeedbackState {
  feedback: FeedbackModel;
  loading: boolean;
  submittedAt: Date | null;
  submitted: boolean;
}

export const FeedbackStore = signalStore(
  withState<FeedbackState>({
    feedback: initialFeedback,
    loading: false,
    submittedAt: null,
    submitted: false,
  }),

  withComputed((state) => ({
    // Check if feedback has been modified from initial state
    hasChanges: computed(
      () => JSON.stringify(state.feedback()) !== JSON.stringify(initialFeedback)
    ),
    // Basic validation check
    isValid: computed(() => {
      const f = state.feedback();
      return (
        f.name.trim().length >= 2 &&
        f.email.includes('@') &&
        f.rating !== null
      );
    }),
    // Get rating label
    ratingLabel: computed(() => {
      const rating = state.feedback().rating;
      const labels: Record<number, string> = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent',
      };
      return rating ? labels[rating] : 'Not rated';
    }),
  })),

  withMethods((store) => ({
    updateFeedback(feedback: Partial<FeedbackModel>) {
      patchState(store, (state) => ({
        feedback: { ...state.feedback, ...feedback },
      }));
    },

    updateField<K extends keyof FeedbackModel>(field: K, value: FeedbackModel[K]) {
      patchState(store, (state) => ({
        feedback: { ...state.feedback, [field]: value },
      }));
    },

    setFeedback(feedback: FeedbackModel) {
      patchState(store, { feedback });
    },

    submitFeedback() {
      patchState(store, { loading: true });

      // Simulate async submit operation
      setTimeout(() => {
        patchState(store, {
          loading: false,
          submittedAt: new Date(),
          submitted: true,
        });
      }, 500);
    },

    reset() {
      patchState(store, {
        feedback: initialFeedback,
        loading: false,
        submittedAt: null,
        submitted: false,
      });
    },
  }))
);
