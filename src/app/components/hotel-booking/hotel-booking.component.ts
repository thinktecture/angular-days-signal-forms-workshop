// This component is used in Exercise 05
// Files: signal-forms-workshop/exercises/05-conditional-validation/*

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HotelBookingModel, HotelGuest } from '../../models/forms.models';

// Cross-field validator: checkout date must be after check-in date
function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const checkIn = group.get('checkInDate')?.value;
  const checkOut = group.get('checkOutDate')?.value;

  if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
    return { invalidDateRange: true };
  }
  return null;
}

@Component({
  selector: 'app-hotel-booking',
  templateUrl: './hotel-booking.component.html',
  styleUrl: './hotel-booking.component.scss',
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelBookingComponent {
  // Exercise 05: Convert this reactive form with conditional validation to Signal Forms
  // See: signal-forms-workshop/exercises/05-conditional-validation/README.md

  private fb = inject(FormBuilder);

  bookingForm: FormGroup = this.fb.group(
    {
      // Booking details
      checkInDate: ['', [Validators.required]],
      checkOutDate: ['', [Validators.required]],
      roomType: ['standard', [Validators.required]],

      // Guests (FormArray)
      guests: this.fb.array([this.createGuestGroup()]),

      // Breakfast option with conditional validation
      includeBreakfast: [false],
      breakfastCount: [null], // Required only when includeBreakfast is true

      // Parking option with conditional validation
      includeParking: [false],
      licensePlate: [''], // Required only when includeParking is true

      // Extra bed option with conditional validation
      needsExtraBed: [false],
      extraBedType: [null], // Required only when needsExtraBed is true

      // Special requests with conditional validation
      hasSpecialRequests: [false],
      specialRequestDetails: [''], // Required only when hasSpecialRequests is true

      // Late checkout (demonstrates delay scenario)
      requestLateCheckout: [false],
      lateCheckoutTime: [''], // Required only when requestLateCheckout is true, min 12:00

      // Contact info
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{6,}$/)]],

      // Payment with conditional validation
      paymentMethod: ['credit_card', [Validators.required]],
      // Credit card fields - required only when paymentMethod is 'credit_card'
      cardNumber: [''],
      cardExpiry: [''],
      cardCvv: [''],
      // Invoice fields - required only when paymentMethod is 'invoice'
      companyName: [''],
      vatNumber: [''],
    },
    {
      validators: [dateRangeValidator],
    }
  );

  submitted = false;
  submittedData: HotelBookingModel | null = null;

  // Options
  roomTypes = [
    { value: 'standard', label: 'Standard Room' },
    { value: 'deluxe', label: 'Deluxe Room' },
    { value: 'suite', label: 'Suite' },
  ];

  extraBedTypes = [
    { value: 'crib', label: 'Baby Crib' },
    { value: 'rollaway', label: 'Rollaway Bed' },
  ];

  paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'invoice', label: 'Invoice' },
  ];

  // Getter for guests FormArray
  get guests(): FormArray {
    return this.bookingForm.get('guests') as FormArray;
  }

  // Create a new guest FormGroup
  private createGuestGroup(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      isChild: [false],
      age: [null], // Required only when isChild is true
    });
  }

  // Add guest
  addGuest(): void {
    this.guests.push(this.createGuestGroup());
  }

  // Remove guest
  removeGuest(index: number): void {
    if (this.guests.length > 1) {
      this.guests.removeAt(index);
    }
  }

  // Update conditional validators when toggle changes
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

  onParkingChange(): void {
    const control = this.bookingForm.get('licensePlate');
    if (this.bookingForm.get('includeParking')?.value) {
      control?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{1,3}[-\s]?[A-Z]{1,2}[-\s]?\d{1,4}$/i)]);
    } else {
      control?.clearValidators();
      control?.setValue('');
    }
    control?.updateValueAndValidity();
  }

  onExtraBedChange(): void {
    const control = this.bookingForm.get('extraBedType');
    if (this.bookingForm.get('needsExtraBed')?.value) {
      control?.setValidators([Validators.required]);
    } else {
      control?.clearValidators();
      control?.setValue(null);
    }
    control?.updateValueAndValidity();
  }

  onSpecialRequestsChange(): void {
    const control = this.bookingForm.get('specialRequestDetails');
    if (this.bookingForm.get('hasSpecialRequests')?.value) {
      control?.setValidators([Validators.required, Validators.minLength(10)]);
    } else {
      control?.clearValidators();
      control?.setValue('');
    }
    control?.updateValueAndValidity();
  }

  onLateCheckoutChange(): void {
    const control = this.bookingForm.get('lateCheckoutTime');
    if (this.bookingForm.get('requestLateCheckout')?.value) {
      control?.setValidators([Validators.required, Validators.pattern(/^(1[2-9]|2[0-3]):[0-5][0-9]$/)]);
    } else {
      control?.clearValidators();
      control?.setValue('');
    }
    control?.updateValueAndValidity();
  }

  onPaymentMethodChange(): void {
    const method = this.bookingForm.get('paymentMethod')?.value;

    // Credit card fields
    const cardNumber = this.bookingForm.get('cardNumber');
    const cardExpiry = this.bookingForm.get('cardExpiry');
    const cardCvv = this.bookingForm.get('cardCvv');

    // Invoice fields
    const companyName = this.bookingForm.get('companyName');
    const vatNumber = this.bookingForm.get('vatNumber');

    if (method === 'credit_card') {
      cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
      cardExpiry?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      cardCvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      companyName?.clearValidators();
      vatNumber?.clearValidators();
      companyName?.setValue('');
      vatNumber?.setValue('');
    } else if (method === 'invoice') {
      companyName?.setValidators([Validators.required]);
      vatNumber?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{2}\d{9,12}$/i)]);
      cardNumber?.clearValidators();
      cardExpiry?.clearValidators();
      cardCvv?.clearValidators();
      cardNumber?.setValue('');
      cardExpiry?.setValue('');
      cardCvv?.setValue('');
    } else {
      // PayPal - no additional fields
      cardNumber?.clearValidators();
      cardExpiry?.clearValidators();
      cardCvv?.clearValidators();
      companyName?.clearValidators();
      vatNumber?.clearValidators();
      cardNumber?.setValue('');
      cardExpiry?.setValue('');
      cardCvv?.setValue('');
      companyName?.setValue('');
      vatNumber?.setValue('');
    }

    [cardNumber, cardExpiry, cardCvv, companyName, vatNumber].forEach((c) => c?.updateValueAndValidity());
  }

  onGuestChildChange(index: number): void {
    const guestGroup = this.guests.at(index) as FormGroup;
    const ageControl = guestGroup.get('age');
    const isChild = guestGroup.get('isChild')?.value;

    if (isChild) {
      ageControl?.setValidators([Validators.required, Validators.min(0), Validators.max(17)]);
    } else {
      ageControl?.clearValidators();
      ageControl?.setValue(null);
    }
    ageControl?.updateValueAndValidity();
  }

  // Helper: Check if a control has errors and is touched
  hasError(controlPath: string): boolean {
    const control = this.bookingForm.get(controlPath);
    return control ? control.invalid && control.touched : false;
  }

  // Helper: Get error message for a control
  getErrorMessage(controlPath: string): string {
    const control = this.bookingForm.get(controlPath);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['email']) return 'Please enter a valid email';
    if (errors['pattern']) return 'Invalid format';

    return 'Invalid value';
  }

  onSubmit(): void {
    // Trigger all conditional validations
    this.onBreakfastChange();
    this.onParkingChange();
    this.onExtraBedChange();
    this.onSpecialRequestsChange();
    this.onLateCheckoutChange();
    this.onPaymentMethodChange();

    // Trigger guest child validations
    this.guests.controls.forEach((_, index) => this.onGuestChildChange(index));

    if (this.bookingForm.valid) {
      this.submitted = true;
      this.submittedData = this.bookingForm.value as HotelBookingModel;
      console.log('Booking submitted:', this.submittedData);
    } else {
      this.bookingForm.markAllAsTouched();
    }
  }

  onReset(): void {
    this.bookingForm.reset({
      checkInDate: '',
      checkOutDate: '',
      roomType: 'standard',
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

    // Reset guests to single empty entry
    while (this.guests.length > 1) {
      this.guests.removeAt(1);
    }
    this.guests.at(0).reset({ firstName: '', lastName: '', isChild: false, age: null });

    // Clear conditional validators
    this.onBreakfastChange();
    this.onParkingChange();
    this.onExtraBedChange();
    this.onSpecialRequestsChange();
    this.onLateCheckoutChange();
    this.onPaymentMethodChange();

    this.submitted = false;
    this.submittedData = null;
  }
}
