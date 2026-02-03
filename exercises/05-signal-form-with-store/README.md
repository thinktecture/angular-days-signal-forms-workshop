# Exercise 05 – Signal Form with Store

## Goals

In this exercise, you will learn how to integrate **Angular Signal Forms** with **NgRx SignalStore** for persistent state management. You'll understand:

- How to create a SignalStore to manage form state
- How to use `linkedSignal` to sync form data with the store
- How to implement save/reset functionality with store integration
- The differences between Reactive Forms and Signal Forms approaches

## Prerequisites

- Completion of Exercises 01-04
- Basic understanding of NgRx SignalStore
- Familiarity with Angular Signals

## Use Case: Contact Profile Editor

We're building a contact profile editor that:
- Loads initial data from a store
- Tracks unsaved changes
- Allows saving changes back to the store
- Supports resetting to the last saved state

## Setup

1. Navigate to the application at `http://localhost:4200/store-form`
2. Open the component at `src/app/components/store-form/store-form.component.ts`
3. Reference the template at `signal-forms-workshop/exercises/05-signal-form-with-store/template/`

## Tasks

### Task 1: Create the SignalStore

Create a SignalStore in `signal-form-store.ts` that manages the contact profile state:

```typescript
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

export const ContactProfileStore = signalStore(
  withState({
    profile: { /* ContactProfile */ },
    savedProfile: { /* ContactProfile */ },
    loading: false,
    lastSaved: null as Date | null,
  }),
  withComputed((state) => ({
    fullName: computed(() => `${state.profile().firstName} ${state.profile().lastName}`),
    hasUnsavedChanges: computed(() =>
      JSON.stringify(state.profile()) !== JSON.stringify(state.savedProfile())
    ),
  })),
  withMethods((store) => ({
    updateProfile(profile: Partial<ContactProfile>) { /* ... */ },
    setProfile(profile: ContactProfile) { /* ... */ },
    saveProfile() { /* ... */ },
    resetToSaved() { /* ... */ },
  }))
);
```

### Task 2: Create the Signal Form with linkedSignal

Use `linkedSignal` to create a form model that derives from and syncs with the store:

```typescript
import { linkedSignal } from '@angular/core';
import { form, required, email, maxLength, FormField } from '@angular/forms/signals';

// linkedSignal creates a writable signal derived from the store
readonly profileModel = linkedSignal(() => this.store.profile());

// Create Signal Form with validation
readonly profileForm = form(this.profileModel, (schema) => {
  required(schema.firstName, { message: 'First name is required' });
  required(schema.lastName, { message: 'Last name is required' });
  required(schema.email, { message: 'Email is required' });
  email(schema.email, { message: 'Please enter a valid email' });
  maxLength(schema.bio, 500, { message: 'Bio cannot exceed 500 characters' });
});
```

### Task 3: Sync Form Changes to Store

Use an `effect` to sync form model changes back to the store:

```typescript
effect(() => {
  const formValue = this.profileModel();
  const storeValue = this.store.profile();

  if (JSON.stringify(formValue) !== JSON.stringify(storeValue)) {
    this.store.setProfile(formValue);
  }
});
```

### Task 4: Implement Save and Reset

```typescript
saveProfile(): void {
  if (this.profileForm().valid()) {
    this.store.saveProfile();
  }
}

resetForm(): void {
  this.store.resetToSaved();
  // linkedSignal automatically updates from store
}
```

### Task 5: Bind Form Fields in Template

Use the `[formField]` directive to bind inputs:

```html
<input matInput [formField]="profileForm.firstName" />

@if (profileForm.firstName().touched() && profileForm.firstName().invalid()) {
  <mat-error>{{ profileForm.firstName().errors()[0]?.message }}</mat-error>
}
```

## Completion Criteria

- [ ] SignalStore holds profile state and tracks saved vs. current values
- [ ] Form initializes with data from the store via `linkedSignal`
- [ ] Form changes are synced back to the store
- [ ] Save button persists current state as "saved"
- [ ] Reset button reverts to last saved state
- [ ] Unsaved changes indicator works correctly
- [ ] Form validation prevents saving invalid data

## Key Concepts

### linkedSignal vs signal

- `signal()`: Independent writable signal
- `linkedSignal()`: Writable signal that derives its value from a source and updates when the source changes

### Signal Forms vs Reactive Forms

| Aspect | Reactive Forms | Signal Forms |
|--------|---------------|--------------|
| Form Creation | `FormBuilder.group()` | `form(model, schema)` |
| Binding | `formControlName` | `[formField]` |
| Value Access | `form.value` | `model()` |
| Validation State | `form.valid` | `form().valid()` |
| Change Detection | Manual / valueChanges | Automatic via signals |

## Hints

- `linkedSignal` automatically updates when the source signal changes
- Use `effect()` for side effects like syncing to the store
- Check `JSON.stringify` equality to avoid circular updates
- Signal Forms automatically handle two-way binding

## Solution

The complete solution is available in the `solution/` folder:
- `contact-profile.store.ts` - NgRx SignalStore implementation
- `store-form.component.ts` - Component with Signal Forms
- `store-form.component.html` - Template with form bindings
- `store-form.component.scss` - Styles
