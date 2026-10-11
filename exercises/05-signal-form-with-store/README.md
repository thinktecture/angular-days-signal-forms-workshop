# Exercise 05 – Signal Form with NgRx SignalStore

## Goals

Connect a Signal Form to an NgRx SignalStore without `effect()`, `valueChanges` or `patchValue()`.

Pattern A, "the store delivers the data":

1. The store holds the persisted profile
2. `linkedSignal()` derives the form model from the store and stays writable for user input
3. `form()` wraps the model
4. The submission action writes the model back to the store

The store owns the persisted truth, the form owns the draft. `dirty()` tells you whether there are unsaved changes.

## Prerequisites

- Completion of Exercises 01-04
- Basic understanding of NgRx SignalStore (`signalStore`, `withState`, `withMethods`, `patchState`)

## Setup

1. Navigate to `http://localhost:4200/store-form`
2. Open `src/app/components/store-form/`
3. Compare with the running solution at `http://localhost:4200/solutions/store-form`

## The Starting Point

`contact-profile.store.ts` is complete:

```typescript
export const ContactProfileStore = signalStore(
  withState<ContactProfileState>({ profile: INITIAL_PROFILE, saving: false, lastSaved: null }),
  withComputed(({ profile }) => ({
    fullName: computed(() => `${profile().firstName} ${profile().lastName}`),
  })),
  withMethods((store) => ({
    async saveProfile(profile: ContactProfile): Promise<void> {
      /* simulated PUT */
    },
    simulateRemoteUpdate(): void {
      /* another client changed the data */
    },
  })),
);
```

The component only injects the store. The `TODO` comments mark what is missing.

<details>
<summary>How this looked with Reactive Forms</summary>

```typescript
constructor() {
  // form → store
  this.profileForm.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
    this.store.updateProfile(value);
  });
  // store → form (guard against the loop)
  effect(() => {
    const profile = this.store.profile();
    if (JSON.stringify(profile) !== JSON.stringify(this.profileForm.getRawValue())) {
      this.profileForm.patchValue(profile, { emitEvent: false });
    }
  });
}
```

Two worlds (RxJS and signals), manual bridging in both directions, and an equality check to avoid a loop.

</details>

## Tasks

### Task 1: Imports

<details>
<summary>Show Solution</summary>

```typescript
import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { FormField, FormRoot, email, form, maxLength, required } from '@angular/forms/signals';
```

Add `FormField` and `FormRoot` to the component `imports`.

</details>

### Task 2: Form Model with linkedSignal()

<details>
<summary>Show Solution</summary>

```typescript
// Follows the store (save, reload, remote update), but user input can overwrite it
readonly profileModel = linkedSignal(() => this.store.profile());
```

</details>

### Task 3: The Form

<details>
<summary>Show Solution</summary>

```typescript
readonly profileForm = form(this.profileModel, (path) => {
  required(path.firstName, { message: 'First name is required' });
  required(path.lastName, { message: 'Last name is required' });
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Please enter a valid email' });
  maxLength(path.bio, 500, { message: 'Bio cannot exceed 500 characters' });
});
```

</details>

### Task 4: Submission Writes to the Store

<details>
<summary>Show Solution</summary>

```typescript
readonly profileForm = form(this.profileModel, schema, {
  submission: {
    action: async (field) => {
      await this.store.saveProfile(field().value());
      // The store now holds the saved value, linkedSignal already points to it.
      // Clear dirty/touched without changing the value:
      field().reset();
      this.snackBar.open('Profile saved successfully!', 'Close', { duration: 3000 });
    },
    onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
  },
});
```

</details>

### Task 5: Reset

<details>
<summary>Show Solution</summary>

```typescript
resetForm(): void {
  // Back to the persisted value and clear dirty/touched
  this.profileForm().reset(this.store.profile());
}
```

</details>

### Tasks 6-10: Template

<details>
<summary>Show Solution</summary>

```html
<form class="profile-form" [formRoot]="profileForm">
  <mat-form-field appearance="outline">
    <mat-label>First Name</mat-label>
    <input matInput [formField]="profileForm.firstName" />
    @if (profileForm.firstName().touched() && profileForm.firstName().invalid()) { @for (error of
    profileForm.firstName().errors(); track error.kind) {
    <mat-error>{{ error.message }}</mat-error>
    } }
  </mat-form-field>
  <!-- ... -->
  <textarea matInput rows="3" [formField]="profileForm.bio"></textarea>
  <mat-hint>{{ profileForm.bio().value().length }} / 500</mat-hint>

  <button
    mat-stroked-button
    type="button"
    (click)="resetForm()"
    [disabled]="!profileForm().dirty()"
  >
    Reset
  </button>
  <button
    mat-flat-button
    type="submit"
    [disabled]="!profileForm().dirty() || profileForm().submitting()"
  >
    {{ profileForm().submitting() ? 'Saving...' : 'Save Profile' }}
  </button>
</form>

<p><strong>Unsaved Changes:</strong> {{ profileForm().dirty() ? 'Yes' : 'No' }}</p>
```

Try "Simulate remote update" while editing: the store changes, `linkedSignal` replaces the draft.

</details>

## Completion Criteria

- [ ] Form model is a `linkedSignal` derived from `store.profile()`
- [ ] No `effect()` and no subscription to keep store and form in sync
- [ ] Save runs through the submission action and `store.saveProfile()`
- [ ] After saving the form is not dirty anymore
- [ ] Reset returns to the persisted profile
- [ ] A remote update replaces the draft

## Bonus: Pattern B – the Form Creates Data

`solutions/feedback-form` shows the other direction: nothing to load, the model is a plain `signal()`, the
submission action hands the value to the store (`submitFeedback`) and resets the form for the next entry.

<details>
<summary>Key Concepts</summary>

| Concept          | `signal()`                   | `linkedSignal()`                                  |
| ---------------- | ---------------------------- | ------------------------------------------------- |
| Source           | Independent                  | Derived from another signal                       |
| Writable         | Yes                          | Yes, until the source changes again               |
| Use for the form | Create scenarios (Pattern B) | Edit scenarios with data from a store (Pattern A) |

| Responsibility  | Store                    | Form                                |
| --------------- | ------------------------ | ----------------------------------- |
| Persisted value | `profile()`              |                                     |
| Draft           |                          | `profileModel()` / `form().value()` |
| Unsaved changes |                          | `form().dirty()`                    |
| Saving          | `saving()` (server side) | `form().submitting()` (action)      |
| Validation      |                          | schema rules                        |

</details>

<details>
<summary>Solution Files</summary>

- `exercises/05-signal-form-with-store/solution/store-form.component.ts`
- `exercises/05-signal-form-with-store/solution/store-form.component.html`
- `exercises/05-signal-form-with-store/solution/feedback.store.ts` / `feedback-form.component.*` (bonus)
- Running: `http://localhost:4200/solutions/store-form` and `http://localhost:4200/solutions/feedback-form`

</details>
