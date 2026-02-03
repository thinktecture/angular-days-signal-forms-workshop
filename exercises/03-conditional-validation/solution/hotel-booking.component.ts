// Exercise 05 Solution: Conditional Validation with Signal Forms
// This demonstrates how to use applyWhen, applyEach, and the `when` option for conditional validation

import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  FormField,
  form,
  required,
  email,
  min,
  max,
  minLength,
  pattern,
  validate,
  applyWhen,
  applyEach,
} from '@angular/forms/signals';
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
  selector: 'app-hotel-booking-solution',
  templateUrl: './hotel-booking.component.html',
  styleUrl: './hotel-booking.component.scss',
  imports: [
    FormField,
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
export class HotelBookingSolutionComponent {
  // Signal-based model (source of truth)
  readonly formModel = signal<HotelBookingModel>({
    checkInDate: '',
    checkOutDate: '',
    roomType: 'standard',
    guests: [{ firstName: '', lastName: '', isChild: false, age: null }],
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
  });

  // Create Signal Form with conditional validation schema
  readonly bookingForm = form(this.formModel, (schema) => {
    // ========================================
    // Basic Required Fields
    // ========================================
    required(schema.checkInDate, { message: 'Check-in date is required' });
    required(schema.checkOutDate, { message: 'Check-out date is required' });
    required(schema.roomType, { message: 'Room type is required' });
    required(schema.contactEmail, { message: 'Email is required' });
    email(schema.contactEmail, { message: 'Please enter a valid email' });
    required(schema.contactPhone, { message: 'Phone is required' });
    pattern(schema.contactPhone, /^\+?[\d\s-]{6,}$/, {
      message: 'Please enter a valid phone number',
    });

    // ========================================
    // Cross-field validation: checkout must be after check-in
    // ========================================
    validate(schema.checkOutDate, ({ value, valueOf }) => {
      const checkOut = value();
      const checkIn = valueOf(schema.checkInDate);
      if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
        return { kind: 'dateRange', message: 'Check-out must be after check-in date' };
      }
      return null;
    });

    // ========================================
    // Guest Array Validation with applyEach
    // ========================================
    applyEach(schema.guests, (guest) => {
      required(guest.firstName, { message: 'First name is required' });
      minLength(guest.firstName, 2, { message: 'Min 2 characters' });

      required(guest.lastName, { message: 'Last name is required' });
      minLength(guest.lastName, 2, { message: 'Min 2 characters' });

      // Conditional: Age only required when guest is a child
      // Using applyWhen to group validators with the same condition
      applyWhen(
        guest.age,
        ({ valueOf }) => valueOf(guest.isChild) === true,
        (agePath) => {
          required(agePath, { message: 'Age is required for children' });
          min(agePath, 0, { message: 'Age cannot be negative' });
          max(agePath, 17, { message: 'Children must be under 18' });
        }
      );
    });

    // ========================================
    // Conditional: Breakfast count when breakfast is included
    // Using applyWhen for multiple validators with same condition
    // ========================================
    applyWhen(
      schema.breakfastCount,
      ({ valueOf }) => valueOf(schema.includeBreakfast) === true,
      (path) => {
        required(path, { message: 'Number of guests for breakfast is required' });
        min(path, 1, { message: 'At least 1 guest for breakfast' });
      }
    );

    // ========================================
    // Conditional: License plate when parking is included
    // ========================================
    applyWhen(
      schema.licensePlate,
      ({ valueOf }) => valueOf(schema.includeParking) === true,
      (path) => {
        required(path, { message: 'License plate is required' });
        pattern(path, /^[A-Z]{1,3}[-\s]?[A-Z]{1,2}[-\s]?\d{1,4}$/i, {
          message: 'Invalid license plate format (e.g., B-AB 1234)',
        });
      }
    );

    // ========================================
    // Conditional: Extra bed type when extra bed is needed
    // ========================================
    required(schema.extraBedType, {
      message: 'Please select extra bed type',
      when: ({ valueOf }) => valueOf(schema.needsExtraBed) === true,
    });

    // ========================================
    // Conditional: Special request details when has requests
    // ========================================
    applyWhen(
      schema.specialRequestDetails,
      ({ valueOf }) => valueOf(schema.hasSpecialRequests) === true,
      (path) => {
        required(path, { message: 'Please describe your requests' });
        minLength(path, 10, { message: 'Please provide more details (min 10 chars)' });
      }
    );

    // ========================================
    // Conditional: Late checkout time when late checkout is requested
    // ========================================
    applyWhen(
      schema.lateCheckoutTime,
      ({ valueOf }) => valueOf(schema.requestLateCheckout) === true,
      (path) => {
        required(path, { message: 'Please specify checkout time' });
        pattern(path, /^(1[2-9]|2[0-3]):[0-5][0-9]$/, {
          message: 'Checkout time must be 12:00 or later',
        });
      }
    );

    // ========================================
    // Payment Method Conditional Validation
    // ========================================

    // Credit card fields - only when payment method is credit_card
    applyWhen(
      schema.cardNumber,
      ({ valueOf }) => valueOf(schema.paymentMethod) === 'credit_card',
      (path) => {
        required(path, { message: 'Card number is required' });
        pattern(path, /^\d{16}$/, { message: 'Card number must be 16 digits' });
      }
    );

    applyWhen(
      schema.cardExpiry,
      ({ valueOf }) => valueOf(schema.paymentMethod) === 'credit_card',
      (path) => {
        required(path, { message: 'Expiry date is required' });
        pattern(path, /^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Format: MM/YY' });
      }
    );

    applyWhen(
      schema.cardCvv,
      ({ valueOf }) => valueOf(schema.paymentMethod) === 'credit_card',
      (path) => {
        required(path, { message: 'CVV is required' });
        pattern(path, /^\d{3,4}$/, { message: 'CVV must be 3-4 digits' });
      }
    );

    // Invoice fields - only when payment method is invoice
    applyWhen(
      schema.companyName,
      ({ valueOf }) => valueOf(schema.paymentMethod) === 'invoice',
      (path) => {
        required(path, { message: 'Company name is required' });
      }
    );

    applyWhen(
      schema.vatNumber,
      ({ valueOf }) => valueOf(schema.paymentMethod) === 'invoice',
      (path) => {
        required(path, { message: 'VAT number is required' });
        pattern(path, /^[A-Z]{2}\d{9,12}$/i, {
          message: 'Invalid VAT number format (e.g., DE123456789)',
        });
      }
    );
  });

  // State
  readonly submitted = signal(false);
  readonly submittedData = signal<HotelBookingModel | null>(null);

  // Computed: Check if form is valid
  readonly isFormValid = computed(() => this.bookingForm().valid());

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

  // Add guest to array
  addGuest(): void {
    const currentGuests = this.formModel().guests;
    this.formModel.update((model) => ({
      ...model,
      guests: [...currentGuests, { firstName: '', lastName: '', isChild: false, age: null }],
    }));
  }

  // Remove guest from array
  removeGuest(index: number): void {
    const currentGuests = this.formModel().guests;
    if (currentGuests.length > 1) {
      this.formModel.update((model) => ({
        ...model,
        guests: currentGuests.filter((_, i) => i !== index),
      }));
    }
  }

  // Submit handler
  onSubmit(): void {
    if (this.bookingForm().valid()) {
      this.submitted.set(true);
      this.submittedData.set({ ...this.formModel() });
      console.log('Booking submitted:', this.submittedData());
    } else {
      // Mark all fields as touched to show errors
      console.log('Form is invalid');
    }
  }

  // Reset handler
  onReset(): void {
    this.formModel.set({
      checkInDate: '',
      checkOutDate: '',
      roomType: 'standard',
      guests: [{ firstName: '', lastName: '', isChild: false, age: null }],
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
    });
    this.submitted.set(false);
    this.submittedData.set(null);
  }
}
