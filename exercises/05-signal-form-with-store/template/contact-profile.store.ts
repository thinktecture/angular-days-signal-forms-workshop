// NgRx SignalStore for Exercise 05. The store owns the *persisted* profile; the form owns the draft.

import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ContactProfile } from '@app/models/forms.models';

export const INITIAL_PROFILE: ContactProfile = {
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
  saving: boolean;
  lastSaved: Date | null;
}

export const ContactProfileStore = signalStore(
  withState<ContactProfileState>({
    profile: INITIAL_PROFILE,
    saving: false,
    lastSaved: null,
  }),

  withComputed(({ profile }) => ({
    fullName: computed(() => `${profile().firstName} ${profile().lastName}`),
  })),

  withMethods((store) => ({
    // Simulates a PUT /api/profile. Resolves when the "server" has stored the profile.
    async saveProfile(profile: ContactProfile): Promise<void> {
      patchState(store, { saving: true });
      await new Promise((resolve) => setTimeout(resolve, 500));
      patchState(store, { profile, saving: false, lastSaved: new Date() });
    },

    // Simulates another client changing the data (e.g. a websocket push)
    simulateRemoteUpdate(): void {
      patchState(store, (state) => ({
        profile: { ...state.profile, role: `${state.profile.role} (updated remotely)` },
      }));
    },
  })),
);
