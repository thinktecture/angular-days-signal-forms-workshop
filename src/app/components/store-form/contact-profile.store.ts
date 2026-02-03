import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { ContactProfile } from '../../models/forms.models';

// Initial state with sample data
const initialProfile: ContactProfile = {
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max.mustermann@example.com',
  phone: '+49 123 456789',
  company: 'Thinktecture AG',
  role: 'Senior Developer',
  bio: 'Passionate about Angular and modern web development.',
};

interface ContactProfileState {
  profile: ContactProfile;
  savedProfile: ContactProfile;
  loading: boolean;
  lastSaved: Date | null;
}

export const ContactProfileStore = signalStore(
  withState<ContactProfileState>({
    profile: initialProfile,
    savedProfile: initialProfile,
    loading: false,
    lastSaved: null,
  }),

  withComputed((state) => ({
    fullName: computed(() => `${state.profile().firstName} ${state.profile().lastName}`),
    hasUnsavedChanges: computed(
      () => JSON.stringify(state.profile()) !== JSON.stringify(state.savedProfile())
    ),
    isValid: computed(() => {
      const p = state.profile();
      return p.firstName.trim() !== '' && p.lastName.trim() !== '' && p.email.includes('@');
    }),
  })),

  withMethods((store) => ({
    updateProfile(profile: Partial<ContactProfile>) {
      patchState(store, (state) => ({
        profile: { ...state.profile, ...profile },
      }));
    },

    updateField<K extends keyof ContactProfile>(field: K, value: ContactProfile[K]) {
      patchState(store, (state) => ({
        profile: { ...state.profile, [field]: value },
      }));
    },

    saveProfile() {
      patchState(store, { loading: true });

      // Simulate async save operation
      setTimeout(() => {
        patchState(store, (state) => ({
          savedProfile: { ...state.profile },
          loading: false,
          lastSaved: new Date(),
        }));
      }, 500);
    },

    resetToSaved() {
      patchState(store, (state) => ({
        profile: { ...state.savedProfile },
      }));
    },

    resetToInitial() {
      patchState(store, {
        profile: initialProfile,
        savedProfile: initialProfile,
        lastSaved: null,
      });
    },
  }))
);
