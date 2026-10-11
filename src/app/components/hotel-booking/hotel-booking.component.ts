// This component is used in Exercise 03: Conditional Validation
// See: exercises/03-conditional-validation/README.md
//
// The form is already a Signal Form with the basic rules. Your task: add the conditional rules.
// Techniques you will use: hidden(), the `when` option, applyWhen(), applyEach(), validate()

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  hidden,
  min,
  pattern,
  required,
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
  selector: 'app-hotel-booking',
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
export class HotelBookingComponent {
  readonly formModel = signal<HotelBookingModel>(INITIAL_VALUE);
  readonly submittedData = signal<HotelBookingModel | null>(null);

  readonly bookingForm = form(
    this.formModel,
    (path) => {
      // ========================================
      // Basic rules (done)
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
      // Example: breakfast count only exists when breakfast is included (done)
      // hidden() removes the field from validation; the template hides it via .hidden()
      // ========================================
      hidden(path.breakfastCount, { when: ({ valueOf }) => !valueOf(path.includeBreakfast) });
      required(path.breakfastCount, { message: 'Number of guests for breakfast is required' });
      min(path.breakfastCount, 1, { message: 'At least 1 guest for breakfast' });

      // TODO 1: Cross-field rule - check-out must be after check-in
      //         Use validate(path.checkOutDate, ({ value, valueOf }) => ...)

      // TODO 2: Extra bed type / late checkout time - same pattern as breakfast (hidden + rules)
      //         extraBedType: required when needsExtraBed
      //         lateCheckoutTime: required + pattern /^(1[2-9]|2[0-3]):[0-5][0-9]$/ when requestLateCheckout

      // TODO 3: License plate (always visible) - required + pattern only when parking is included
      //         Use applyWhen(path.licensePlate, condition, (plate) => { ...rules })
      //         Pattern: /^[A-Z]{1,3}[-\s]?[A-Z]{1,2}[-\s]?\d{1,4}$/i

      // TODO 4: Special request details (always visible) - required + minLength(10)
      //         only when hasSpecialRequests. Use the `when` option on each rule.

      // TODO 5 (bonus): Payment - group the rules with applyWhen(path, condition, (p) => { ... })
      //         credit_card: cardNumber /^\d{16}$/, cardExpiry /^(0[1-9]|1[0-2])\/\d{2}$/, cardCvv /^\d{3,4}$/
      //         invoice:     companyName required, vatNumber /^[A-Z]{2}\d{9,12}$/i

      // TODO 6 (bonus): Guests - applyEach(path.guests, (guest) => { ... })
      //         firstName/lastName required + minLength(2)
      //         age: required + min(0) + max(17), but only when isChild (applyWhen on guest.age)
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
