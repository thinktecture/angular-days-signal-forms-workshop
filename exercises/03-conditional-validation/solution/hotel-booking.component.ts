// Solution for Exercise 03: Conditional Validation with Signal Forms
//
// Techniques:
// - hidden({ when })  → the field is not part of the form while hidden (no validation, no dirty)
// - `when` option     → a single rule applies only when the condition is true
// - applyWhen()       → a group of rules applies only when the condition is true
// - applyEach()       → rules for every item of an array
// - validate()        → custom (cross-field) rule reading other fields via valueOf()

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  applyEach,
  applyWhen,
  email,
  form,
  hidden,
  max,
  min,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { HotelBookingModel, HotelGuest } from '@app/models/forms.models';

const EMPTY_GUEST: HotelGuest = { firstName: '', lastName: '', isChild: false, age: null };

const INITIAL_VALUE: HotelBookingModel = {
  checkInDate: '',
  checkOutDate: '',
  roomType: 'standard',
  guests: [EMPTY_GUEST],
  includeBreakfast: false,
  breakfastCount: null,
  includeParking: false,
  licensePlate: '',
  needsExtraBed: false,
  extraBedType: null,
  hasSpecialRequests: false,
  specialRequestDetails: '',
  requestLateCheckout: false,
  lateCheckoutTime: '',
  contactEmail: '',
  contactPhone: '',
  paymentMethod: 'credit_card',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  companyName: '',
  vatNumber: '',
};

@Component({
  selector: 'app-hotel-booking-solution',
  templateUrl: './hotel-booking.component.html',
  styleUrl: './hotel-booking.component.scss',
  imports: [
    FormField,
    FormRoot,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelBookingSolutionComponent {
  readonly formModel = signal<HotelBookingModel>(INITIAL_VALUE);
  readonly submittedData = signal<HotelBookingModel | null>(null);

  readonly bookingForm = form(
    this.formModel,
    (path) => {
      // ========================================
      // Basic rules
      // ========================================
      required(path.checkInDate, { message: 'Check-in date is required' });
      required(path.checkOutDate, { message: 'Check-out date is required' });
      required(path.roomType, { message: 'Room type is required' });
      required(path.contactEmail, { message: 'Email is required' });
      email(path.contactEmail, { message: 'Please enter a valid email' });
      required(path.contactPhone, { message: 'Phone is required' });
      pattern(path.contactPhone, /^\+?[\d\s-]{6,}$/, {
        message: 'Please enter a valid phone number',
      });

      // ========================================
      // 1. Cross-field rule: check-out must be after check-in
      //    validate() receives the FieldContext; valueOf() reads any other field reactively.
      //    (With a Date model you could use minDate(path.checkOutDate, ({ valueOf }) => ...).)
      // ========================================
      validate(path.checkOutDate, ({ value, valueOf }) => {
        const checkOut = value();
        const checkIn = valueOf(path.checkInDate);
        if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
          return { kind: 'dateRange', message: 'Check-out must be after check-in date' };
        }
        return null;
      });

      // ========================================
      // 2. Fields that only exist when an option is selected: hidden({ when })
      //    A hidden field does not contribute to validity, touched or dirty of the form.
      //    The rules themselves stay static, the template reacts with @if (!field().hidden()).
      // ========================================
      hidden(path.breakfastCount, { when: ({ valueOf }) => !valueOf(path.includeBreakfast) });
      required(path.breakfastCount, { message: 'Number of guests for breakfast is required' });
      min(path.breakfastCount, 1, { message: 'At least 1 guest for breakfast' });

      hidden(path.extraBedType, { when: ({ valueOf }) => !valueOf(path.needsExtraBed) });
      required(path.extraBedType, { message: 'Please select extra bed type' });

      hidden(path.lateCheckoutTime, { when: ({ valueOf }) => !valueOf(path.requestLateCheckout) });
      required(path.lateCheckoutTime, { message: 'Please specify checkout time' });
      pattern(path.lateCheckoutTime, /^(1[2-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Checkout time must be 12:00 or later',
      });

      // ========================================
      // 3. Field stays visible, a group of rules applies conditionally: applyWhen()
      // ========================================
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

      // ========================================
      // 4. Field stays visible, single rules apply conditionally: the `when` option
      // ========================================
      required(path.specialRequestDetails, {
        message: 'Please describe your requests',
        when: ({ valueOf }) => valueOf(path.hasSpecialRequests),
      });
      minLength(path.specialRequestDetails, 10, {
        message: 'Please provide more details (min 10 chars)',
        when: ({ valueOf }) => valueOf(path.hasSpecialRequests),
      });

      // ========================================
      // 5. Payment: applyWhen() on the parent path groups rules for several fields
      // ========================================
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
          pattern(booking.vatNumber, /^[A-Z]{2}\d{9,12}$/i, {
            message: 'Invalid VAT number format (e.g., DE123456789)',
          });
        },
      );

      // ========================================
      // 6. Guests: applyEach() binds rules to every array item.
      //    Inside, `guest` is the path of one item; conditions can read its sibling fields.
      // ========================================
      applyEach(path.guests, (guest) => {
        required(guest.firstName, { message: 'First name is required' });
        minLength(guest.firstName, 2, { message: 'Min 2 characters' });
        required(guest.lastName, { message: 'Last name is required' });
        minLength(guest.lastName, 2, { message: 'Min 2 characters' });

        // Age only matters for children
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
    },
    {
      submission: {
        action: async (field) => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          this.submittedData.set(field().value());
          console.log('Booking submitted:', field().value());
        },
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  // Options
  readonly roomTypes = [
    { value: 'standard', label: 'Standard Room' },
    { value: 'deluxe', label: 'Deluxe Room' },
    { value: 'suite', label: 'Suite' },
  ];

  readonly extraBedTypes = [
    { value: 'crib', label: 'Baby Crib' },
    { value: 'rollaway', label: 'Rollaway Bed' },
  ];

  readonly paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'invoice', label: 'Invoice' },
  ];

  // Arrays live in the model signal: immutable updates instead of push()/removeAt()
  addGuest(): void {
    this.formModel.update((model) => ({ ...model, guests: [...model.guests, EMPTY_GUEST] }));
  }

  removeGuest(index: number): void {
    this.formModel.update((model) => ({
      ...model,
      guests: model.guests.filter((_, i) => i !== index),
    }));
  }

  onReset(): void {
    this.bookingForm().reset(INITIAL_VALUE);
    this.submittedData.set(null);
  }
}
