// Exercise 05: Conditional Validation with Signal Forms
// This is the starting point. Your task is to convert the Reactive Form to Signal Forms
// using applyWhen, applyEach, and the `when` option for conditional validation.
//
// Steps:
// 1. Import Signal Forms: form, FormField, required, email, min, max, minLength, pattern, validate, applyWhen, applyEach
// 2. Create a signal-based model with all form fields
// 3. Use applyWhen for conditional validators (breakfast, parking, payment fields, etc.)
// 4. Use applyEach for guest array validation
// 5. Use the `when` option for single conditional validators (e.g., required)
// 6. Use validate() for cross-field date validation
// 7. Remove all (change) event handlers - Signal Forms handles reactivity automatically!

import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
// TODO: Import Signal Forms API
// import {
//   FormField,
//   form,
//   required,
//   email,
//   min,
//   max,
//   minLength,
//   pattern,
//   validate,
//   applyWhen,
//   applyEach,
// } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

import { HotelBookingModel, HotelGuest } from '../../../../src/app/models/forms.models';

@Component({
  selector: 'app-hotel-booking-exercise',
  templateUrl: './hotel-booking.component.html',
  styleUrl: './hotel-booking.component.scss',
  imports: [
    // TODO: Add FormField to imports
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelBookingExerciseComponent {
  // TODO: Step 1 - Create a signal-based model (source of truth)
  // Hint: Initialize with default values for all fields
  //
  // readonly formModel = signal<HotelBookingModel>({
  //   checkInDate: '',
  //   checkOutDate: '',
  //   roomType: 'standard',
  //   guests: [{ firstName: '', lastName: '', isChild: false, age: null }],
  //   includeBreakfast: false,
  //   breakfastCount: null,
  //   includeParking: false,
  //   licensePlate: '',
  //   needsExtraBed: false,
  //   extraBedType: null,
  //   hasSpecialRequests: false,
  //   specialRequestDetails: '',
  //   requestLateCheckout: false,
  //   lateCheckoutTime: '',
  //   contactEmail: '',
  //   contactPhone: '',
  //   paymentMethod: 'credit_card',
  //   cardNumber: '',
  //   cardExpiry: '',
  //   cardCvv: '',
  //   companyName: '',
  //   vatNumber: '',
  // });

  // TODO: Step 2 - Create the Signal Form with conditional validation schema
  //
  // readonly bookingForm = form(this.formModel, (schema) => {
  //   // Basic required fields
  //   required(schema.checkInDate, { message: 'Check-in date is required' });
  //   required(schema.checkOutDate, { message: 'Check-out date is required' });
  //   // ... more validators
  //
  //   // Cross-field validation: checkout must be after check-in
  //   validate(schema.checkOutDate, ({ value, valueOf }) => {
  //     const checkOut = value();
  //     const checkIn = valueOf(schema.checkInDate);
  //     if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
  //       return { kind: 'dateRange', message: 'Check-out must be after check-in date' };
  //     }
  //     return null;
  //   });
  //
  //   // Guest array validation with applyEach
  //   applyEach(schema.guests, (guest) => {
  //     required(guest.firstName, { message: 'First name is required' });
  //     // ... more guest validators
  //
  //     // Conditional age validation using applyWhen (groups multiple validators)
  //     applyWhen(
  //       guest.age,
  //       ({ valueOf }) => valueOf(guest.isChild) === true,
  //       (agePath) => {
  //         required(agePath, { message: 'Age is required for children' });
  //         min(agePath, 0, { message: 'Age cannot be negative' });
  //         max(agePath, 17, { message: 'Children must be under 18' });
  //       }
  //     );
  //   });
  //
  //   // Conditional breakfast validation using applyWhen
  //   applyWhen(
  //     schema.breakfastCount,
  //     ({ valueOf }) => valueOf(schema.includeBreakfast) === true,
  //     (path) => {
  //       required(path, { message: 'Number of guests for breakfast is required' });
  //       min(path, 1, { message: 'At least 1 guest for breakfast' });
  //     }
  //   );
  //
  //   // ... more conditional validators for parking, payment, etc.
  // });

  // State
  readonly submitted = signal(false);
  readonly submittedData = signal<HotelBookingModel | null>(null);

  // TODO: Step 3 - Create computed for form validity
  // readonly isFormValid = computed(() => this.bookingForm().valid());

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

  // TODO: Step 4 - Implement addGuest method
  // Hint: Update the formModel signal to add a new guest to the array
  //
  // addGuest(): void {
  //   const currentGuests = this.formModel().guests;
  //   this.formModel.update((model) => ({
  //     ...model,
  //     guests: [...currentGuests, { firstName: '', lastName: '', isChild: false, age: null }],
  //   }));
  // }

  // TODO: Step 5 - Implement removeGuest method
  //
  // removeGuest(index: number): void {
  //   const currentGuests = this.formModel().guests;
  //   if (currentGuests.length > 1) {
  //     this.formModel.update((model) => ({
  //       ...model,
  //       guests: currentGuests.filter((_, i) => i !== index),
  //     }));
  //   }
  // }

  // TODO: Step 6 - Implement submit handler
  //
  // onSubmit(): void {
  //   if (this.bookingForm().valid()) {
  //     this.submitted.set(true);
  //     this.submittedData.set({ ...this.formModel() });
  //     console.log('Booking submitted:', this.submittedData());
  //   } else {
  //     console.log('Form is invalid');
  //   }
  // }

  // TODO: Step 7 - Implement reset handler
  //
  // onReset(): void {
  //   this.formModel.set({
  //     checkInDate: '',
  //     checkOutDate: '',
  //     roomType: 'standard',
  //     guests: [{ firstName: '', lastName: '', isChild: false, age: null }],
  //     includeBreakfast: false,
  //     breakfastCount: null,
  //     // ... reset all other fields
  //   });
  //   this.submitted.set(false);
  //   this.submittedData.set(null);
  // }

  // Placeholder methods (remove after implementing)
  addGuest(): void {
    console.log('TODO: Implement addGuest');
  }

  removeGuest(index: number): void {
    console.log('TODO: Implement removeGuest', index);
  }

  onSubmit(): void {
    console.log('TODO: Implement onSubmit');
  }

  onReset(): void {
    console.log('TODO: Implement onReset');
  }
}
