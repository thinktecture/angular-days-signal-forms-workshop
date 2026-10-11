# Exercise 03 – Conditional Validation (Hotel Booking)

## Goals

Rules that depend on other fields are declared once in the schema. No `(change)` handlers, no `setValidators()`,
no `updateValueAndValidity()`.

You will use:

- `hidden({ when })` for fields that only exist when an option is selected
- the `when` option to apply a single rule conditionally
- `applyWhen()` to apply a group of rules conditionally
- `applyEach()` for rules per array item
- `validate()` with `valueOf()` for cross-field rules

## Prerequisites

- Completion of Exercise 01 and 02

## Setup

1. Navigate to `http://localhost:4200/hotel-booking`
2. Open `src/app/components/hotel-booking/`
3. Compare with the running solution at `http://localhost:4200/solutions/hotel-booking`

## The Starting Point

The form is already a Signal Form with the basic rules and all bindings. The breakfast option is implemented as an
example. The `TODO` comments in the schema mark the missing rules.

<details>
<summary>How this looked with Reactive Forms</summary>

```typescript
onBreakfastChange(): void {
  const control = this.bookingForm.get('breakfastCount');
  if (this.bookingForm.get('includeBreakfast')?.value) {
    control?.setValidators([Validators.required, Validators.min(1)]);
  } else {
    control?.clearValidators();
    control?.setValue(null);
  }
  control?.updateValueAndValidity();
}
```

One method per conditional field, called from `(change)` handlers and again in `onSubmit()`.

</details>

## Scenarios

| Trigger               | Field(s)                                 | Technique                              |
| --------------------- | ---------------------------------------- | -------------------------------------- |
| `includeBreakfast`    | `breakfastCount`                         | `hidden()` + static rules (example)    |
| `checkInDate`         | `checkOutDate`                           | `validate()` + `valueOf()` (Task 1)    |
| `needsExtraBed`       | `extraBedType`                           | `hidden()` + static rules (Task 2)     |
| `requestLateCheckout` | `lateCheckoutTime`                       | `hidden()` + static rules (Task 2)     |
| `includeParking`      | `licensePlate` (always visible)          | `applyWhen()` on the field (Task 3)    |
| `hasSpecialRequests`  | `specialRequestDetails` (always visible) | `when` option on each rule (Task 4)    |
| `paymentMethod`       | card fields / invoice fields             | `applyWhen()` on the parent (Task 5)   |
| `guests[i].isChild`   | `guests[i].age`                          | `applyEach()` + `applyWhen()` (Task 6) |

## Tasks

### Task 1: Cross-Field Rule (Dates)

<details>
<summary>Show Solution</summary>

```typescript
validate(path.checkOutDate, ({ value, valueOf }) => {
  const checkOut = value();
  const checkIn = valueOf(path.checkInDate);
  if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
    return { kind: 'dateRange', message: 'Check-out must be after check-in date' };
  }
  return null;
});
```

`valueOf()` is reactive: the rule re-runs when the check-in date changes. With a `Date` model you could also use
`minDate(path.checkOutDate, ({ valueOf }) => ...)`.

</details>

### Task 2: Hidden Fields (Extra Bed, Late Checkout)

A hidden field does not contribute to validity, touched or dirty state of the form. The rules stay static, the
template reacts with `@if (!field().hidden())`.

<details>
<summary>Show Solution</summary>

```typescript
hidden(path.extraBedType, { when: ({ valueOf }) => !valueOf(path.needsExtraBed) });
required(path.extraBedType, { message: 'Please select extra bed type' });

hidden(path.lateCheckoutTime, { when: ({ valueOf }) => !valueOf(path.requestLateCheckout) });
required(path.lateCheckoutTime, { message: 'Please specify checkout time' });
pattern(path.lateCheckoutTime, /^(1[2-9]|2[0-3]):[0-5][0-9]$/, {
  message: 'Checkout time must be 12:00 or later',
});
```

```html
<!-- BEFORE: @if (formModel().needsExtraBed) -->
@if (!bookingForm.extraBedType().hidden()) {
<mat-select [formField]="bookingForm.extraBedType">...</mat-select>
}
```

</details>

### Task 3: applyWhen() on a Field (License Plate)

The field stays visible, two rules apply only when parking is included.

<details>
<summary>Show Solution</summary>

```typescript
applyWhen(
  path.licensePlate,
  ({ valueOf }) => valueOf(path.includeParking),
  (plate) => {
    required(plate, { message: 'License plate is required' });
    pattern(plate, /^[A-Z]{1,3}[-\s]?[A-Z]{1,2}[-\s]?\d{1,4}$/i, {
      message: 'Invalid license plate format (e.g., B-AB 1234)',
    });
  },
);
```

</details>

### Task 4: The `when` Option (Special Requests)

<details>
<summary>Show Solution</summary>

```typescript
required(path.specialRequestDetails, {
  message: 'Please describe your requests',
  when: ({ valueOf }) => valueOf(path.hasSpecialRequests),
});
minLength(path.specialRequestDetails, 10, {
  message: 'Please provide more details (min 10 chars)',
  when: ({ valueOf }) => valueOf(path.hasSpecialRequests),
});
```

</details>

### Task 5 (Bonus): applyWhen() on the Parent (Payment)

`applyWhen()` on the root path groups rules for several fields under one condition.

<details>
<summary>Show Solution</summary>

```typescript
applyWhen(
  path,
  ({ valueOf }) => valueOf(path.paymentMethod) === 'credit_card',
  (booking) => {
    required(booking.cardNumber, { message: 'Card number is required' });
    pattern(booking.cardNumber, /^\d{16}$/, { message: 'Card number must be 16 digits' });
    required(booking.cardExpiry, { message: 'Expiry date is required' });
    pattern(booking.cardExpiry, /^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Format: MM/YY' });
    required(booking.cardCvv, { message: 'CVV is required' });
    pattern(booking.cardCvv, /^\d{3,4}$/, { message: 'CVV must be 3-4 digits' });
  },
);

applyWhen(
  path,
  ({ valueOf }) => valueOf(path.paymentMethod) === 'invoice',
  (booking) => {
    required(booking.companyName, { message: 'Company name is required' });
    required(booking.vatNumber, { message: 'VAT number is required' });
    pattern(booking.vatNumber, /^[A-Z]{2}\d{9,12}$/i, { message: 'Invalid VAT number format' });
  },
);
```

</details>

### Task 6 (Bonus): Arrays with applyEach() (Guests)

<details>
<summary>Show Solution</summary>

```typescript
applyEach(path.guests, (guest) => {
  required(guest.firstName, { message: 'First name is required' });
  minLength(guest.firstName, 2, { message: 'Min 2 characters' });
  required(guest.lastName, { message: 'Last name is required' });
  minLength(guest.lastName, 2, { message: 'Min 2 characters' });

  applyWhen(
    guest.age,
    ({ valueOf }) => valueOf(guest.isChild),
    (age) => {
      required(age, { message: 'Age is required for children' });
      min(age, 0, { message: 'Age cannot be negative' });
      max(age, 17, { message: 'Children must be under 18' });
    },
  );
});
```

</details>

## Completion Criteria

- [ ] Check-out date is validated against the check-in date
- [ ] Extra bed type and late checkout time use `hidden()`
- [ ] License plate rules only apply when parking is included
- [ ] Special request details only validate when the checkbox is checked
- [ ] (Bonus) Payment fields validate depending on the payment method
- [ ] (Bonus) Child age is validated per guest
- [ ] No `(change)` handlers, no imperative validator management

<details>
<summary>Which technique when?</summary>

| Situation                                                     | Use                                    |
| ------------------------------------------------------------- | -------------------------------------- |
| Field only exists in some cases (not rendered otherwise)      | `hidden({ when })`                     |
| Field is rendered, one rule applies conditionally             | `when` option on the rule              |
| Field is rendered, several rules apply conditionally          | `applyWhen(path.field, ...)`           |
| Several fields share one condition                            | `applyWhen(path, ...)` on the parent   |
| Rules depend on the shape of a union type                     | `applyWhenValue(path, typeGuard, ...)` |
| Field should be visible but not editable                      | `disabled({ when })` / `readonly()`    |
| Error should land on a different field than the validated one | `validateTree()` with `fieldTree`      |

</details>

<details>
<summary>Solution Files</summary>

- `exercises/03-conditional-validation/solution/hotel-booking.component.ts`
- `exercises/03-conditional-validation/solution/hotel-booking.component.html`
- Running: `http://localhost:4200/solutions/hotel-booking`

</details>
