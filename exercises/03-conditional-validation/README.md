# Exercise 03 – Conditional Validation (Hotel Booking)

## Goals

In this exercise, you will learn how to implement conditional validation in Signal Forms - validators that only apply when certain conditions are met.

You will:

- Use `applyWhenValue` to conditionally apply validation rules
- Use the `when` option for individual validators
- Handle complex conditional logic with multiple dependencies
- Manage FormArrays with conditional validation per item

## Prerequisites

- Completion of Exercise 02 (Reactive to Signal Forms)
- Understanding of basic Signal Forms validation

## Setup

1. Start the dev server: `npm run start`
2. Navigate to `http://localhost:4200/hotel-booking`
3. Open the component at `src/app/components/hotel-booking/`

## The Starting Point

The existing Reactive Form demonstrates conditional validation using:

- Manual `setValidators()` / `clearValidators()` calls
- `(change)` event handlers to update validators
- `updateValueAndValidity()` after each change
- Complex boilerplate for each conditional field

**Pain points with Reactive Forms:**

- Imperative code scattered across multiple methods
- Easy to forget `updateValueAndValidity()`
- Validators must be manually added/removed
- State can get out of sync

## Conditional Validation Scenarios

This form includes several conditional validation patterns:

| Trigger Field | Conditional Field | Condition |
|---------------|-------------------|-----------|
| `includeBreakfast` | `breakfastCount` | Required + min(1) when breakfast is included |
| `includeParking` | `licensePlate` | Required + pattern when parking is included |
| `needsExtraBed` | `extraBedType` | Required when extra bed is needed |
| `hasSpecialRequests` | `specialRequestDetails` | Required + minLength(10) when has requests |
| `requestLateCheckout` | `lateCheckoutTime` | Required + pattern (≥12:00) when late checkout |
| `paymentMethod` | Card/Invoice fields | Different fields required based on payment type |
| `guests[i].isChild` | `guests[i].age` | Required + range(0-17) when guest is a child |

## Tasks

### Task 1: Update Imports

Replace Reactive Forms with Signal Forms imports.

<details>
<summary>Show Solution</summary>

```typescript
// BEFORE
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';

// AFTER
import {
  FormField,
  form,
  required,
  min,
  minLength,
  pattern,
  applyWhenValue,
} from '@angular/forms/signals';
```

</details>

### Task 2: Create Model Signal

Replace FormBuilder with a signal-based model.

<details>
<summary>Show Solution</summary>

```typescript
formModel = signal<HotelBookingModel>({
  checkInDate: '',
  checkOutDate: '',
  roomType: 'standard',
  guests: [{ firstName: '', lastName: '', isChild: false, age: null }],
  includeBreakfast: false,
  breakfastCount: null,
  includeParking: false,
  licensePlate: '',
  // ... rest of the fields
});
```

</details>

### Task 3: Implement Conditional Validation with `applyWhenValue`

Use `applyWhenValue` to apply validation only when a condition is met.

<details>
<summary>Show Solution</summary>

```typescript
bookingForm = form(this.formModel, (schema) => {
  // Basic required fields
  required(schema.checkInDate);
  required(schema.checkOutDate);
  required(schema.roomType);
  required(schema.contactEmail);
  required(schema.contactPhone);

  // Conditional: Breakfast count only required when breakfast is included
  applyWhenValue(schema.includeBreakfast, (isIncluded) => isIncluded, (path) => {
    required(path.breakfastCount, { message: 'Number of guests for breakfast is required' });
    min(path.breakfastCount, 1, { message: 'At least 1 guest for breakfast' });
  });

  // Conditional: License plate only required when parking is included
  applyWhenValue(schema.includeParking, (isIncluded) => isIncluded, (path) => {
    required(path.licensePlate, { message: 'License plate is required' });
    pattern(path.licensePlate, /^[A-Z]{1,3}[-\s]?[A-Z]{1,2}[-\s]?\d{1,4}$/i, {
      message: 'Invalid license plate format',
    });
  });

  // Conditional: Extra bed type only required when extra bed is needed
  applyWhenValue(schema.needsExtraBed, (needs) => needs, (path) => {
    required(path.extraBedType, { message: 'Please select extra bed type' });
  });

  // Conditional: Special request details only required when has requests
  applyWhenValue(schema.hasSpecialRequests, (has) => has, (path) => {
    required(path.specialRequestDetails, { message: 'Please describe your requests' });
    minLength(path.specialRequestDetails, 10, { message: 'Please provide more details (min 10 chars)' });
  });

  // Conditional: Late checkout time only required when late checkout is requested
  applyWhenValue(schema.requestLateCheckout, (requested) => requested, (path) => {
    required(path.lateCheckoutTime, { message: 'Please specify checkout time' });
    pattern(path.lateCheckoutTime, /^(1[2-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Checkout time must be 12:00 or later',
    });
  });
});
```

</details>

### Task 4: Implement Payment Method Conditional Validation

Handle multiple conditional fields based on payment method selection.

<details>
<summary>Show Solution</summary>

```typescript
// Credit card fields - only when payment method is credit_card
applyWhenValue(
  schema.paymentMethod,
  (method) => method === 'credit_card',
  (path) => {
    required(path.cardNumber, { message: 'Card number is required' });
    pattern(path.cardNumber, /^\d{16}$/, { message: 'Card number must be 16 digits' });

    required(path.cardExpiry, { message: 'Expiry date is required' });
    pattern(path.cardExpiry, /^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Format: MM/YY' });

    required(path.cardCvv, { message: 'CVV is required' });
    pattern(path.cardCvv, /^\d{3,4}$/, { message: 'CVV must be 3-4 digits' });
  }
);

// Invoice fields - only when payment method is invoice
applyWhenValue(
  schema.paymentMethod,
  (method) => method === 'invoice',
  (path) => {
    required(path.companyName, { message: 'Company name is required' });
    required(path.vatNumber, { message: 'VAT number is required' });
    pattern(path.vatNumber, /^[A-Z]{2}\d{9,12}$/i, {
      message: 'Invalid VAT number format',
    });
  }
);
```

</details>

### Task 5: Implement Guest Array with Conditional Validation

Apply conditional validation to each item in a FormArray.

<details>
<summary>Show Solution</summary>

```typescript
// Guest array validation
forEachItem(schema.guests, (guest) => {
  required(guest.firstName, { message: 'First name is required' });
  minLength(guest.firstName, 2);

  required(guest.lastName, { message: 'Last name is required' });
  minLength(guest.lastName, 2);

  // Conditional: Age only required when guest is a child
  applyWhenValue(guest.isChild, (isChild) => isChild, (guestPath) => {
    required(guestPath.age, { message: 'Age is required for children' });
    min(guestPath.age, 0, { message: 'Age cannot be negative' });
    max(guestPath.age, 17, { message: 'Children must be under 18' });
  });
});
```

</details>

### Task 6: Alternative - Using `when` Option

For simpler conditions, use the `when` option directly on validators.

<details>
<summary>Show Solution</summary>

```typescript
// Alternative: Using "when" option instead of applyWhenValue
required(schema.breakfastCount, {
  message: 'Number of guests for breakfast is required',
  when: (ctx) => ctx.valueOf(schema.includeBreakfast),
});

min(schema.breakfastCount, 1, {
  message: 'At least 1 guest for breakfast',
  when: (ctx) => ctx.valueOf(schema.includeBreakfast),
});

// When to use which approach:
// - applyWhenValue: Multiple validators with same condition, cleaner grouping
// - when option: Single validator with simple condition
```

</details>

### Task 7: Cross-Field Validation (Date Range)

Implement cross-field validation for check-in/check-out dates.

<details>
<summary>Show Solution</summary>

```typescript
// Cross-field validation: checkout must be after check-in
custom(schema.checkOutDate, (value, ctx) => {
  const checkIn = ctx.valueOf(schema.checkInDate);
  if (checkIn && value && new Date(value) <= new Date(checkIn)) {
    return { message: 'Check-out must be after check-in date' };
  }
  return null;
});
```

</details>

### Task 8: Update Template

Remove event handlers and simplify the template.

<details>
<summary>Show Solution</summary>

```html
<!-- BEFORE: Required event handler -->
<input
  type="checkbox"
  formControlName="includeBreakfast"
  (change)="onBreakfastChange()"
/>

<!-- AFTER: No event handler needed! -->
<input
  type="checkbox"
  [formField]="bookingForm.includeBreakfast"
/>

<!-- Conditional field visibility -->
@if (formModel().includeBreakfast) {
  <div class="conditional-field">
    <input [formField]="bookingForm.breakfastCount" />
    @if (bookingForm.breakfastCount().invalid() && bookingForm.breakfastCount().touched()) {
      @for (error of bookingForm.breakfastCount().errors(); track error.message) {
        <span class="error">{{ error.message }}</span>
      }
    }
  </div>
}
```

</details>

## Completion Criteria

- [ ] All conditional validation implemented with `applyWhenValue` or `when`
- [ ] No manual `setValidators()` / `clearValidators()` calls
- [ ] No `(change)` event handlers for validation updates
- [ ] Payment method switches correctly between credit card and invoice fields
- [ ] Guest child age validation works per array item
- [ ] Cross-field date validation works
- [ ] Form submits only when all conditional validations pass

<details>
<summary>Conditional Validation Cheat Sheet</summary>

| Reactive Forms | Signal Forms |
|----------------|--------------|
| `setValidators()` in change handler | `applyWhenValue(trigger, condition, validators)` |
| `clearValidators()` + reset | Automatic - validators only run when condition is true |
| `updateValueAndValidity()` | Automatic |
| Manual state management | Declarative schema |
| `when` option | `required(field, { when: (ctx) => condition })` |
| Reading other fields | `ctx.valueOf(otherField)` |

**`applyWhenValue` Signature:**

```typescript
applyWhenValue(
  triggerPath,              // The field that triggers the condition
  conditionFn,              // (value) => boolean - when to apply
  validatorsFn              // (path) => { ...validators } - what to apply
);
```

**`when` Option:**

```typescript
required(schema.field, {
  message: 'Required when condition is true',
  when: (ctx) => ctx.valueOf(schema.otherField) === 'someValue',
});
```

</details>

<details>
<summary>Key Benefits</summary>

### 1. Declarative Instead of Imperative

Validation rules are declared in one place, not scattered across event handlers.

### 2. Automatic State Management

No need to manually call `updateValueAndValidity()` - Signal Forms handles it.

### 3. Type Safety

`applyWhenValue` provides typed access to the schema paths.

### 4. Cleaner Templates

No `(change)` handlers needed for validation - just bind the checkbox.

### 5. Easier Testing

Validation logic is centralized and easier to test.

</details>

<details>
<summary>Solution Files</summary>

See the complete solution in:

- `signal-forms-workshop/exercises/03-conditional-validation/solution/`

</details>
