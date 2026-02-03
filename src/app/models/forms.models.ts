export interface TemplateToSignalFormModel {
  name: string;
  email: string;
  age: number | null;
  newsletter: boolean;
}

// Phone number entry for FormArray
export interface PhoneNumber {
  type: 'home' | 'work' | 'mobile';
  number: string;
}

// Nested address object
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Registration form model with nested objects and arrays
export interface RegistrationFormModel {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;

  // Password with cross-field validation
  password: string;
  confirmPassword: string;

  // Nested object
  address: Address;

  // FormArray
  phoneNumbers: PhoneNumber[];

  // Terms acceptance
  acceptTerms: boolean;
}

// Exercise 03: Contact Profile for Signal Form with Store
export interface ContactProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  bio: string;
}

export interface DynamicJsonFormModel {
  // generic map of field values
  [key: string]: unknown;
}

// ============================================================
// Exercise 05: Hotel Booking - Conditional Validation
// ============================================================

// Guest information for FormArray
export interface HotelGuest {
  firstName: string;
  lastName: string;
  isChild: boolean;
  // Conditional: age required only for children (for child pricing)
  age: number | null;
}

// Hotel booking model with many conditional fields
export interface HotelBookingModel {
  // Booking details
  checkInDate: string;
  checkOutDate: string;
  roomType: 'standard' | 'deluxe' | 'suite';

  // Guests array (FormArray)
  guests: HotelGuest[];

  // Breakfast option
  includeBreakfast: boolean;
  // Conditional: number of breakfast guests only if breakfast included
  breakfastCount: number | null;

  // Parking option
  includeParking: boolean;
  // Conditional: license plate only if parking included
  licensePlate: string;

  // Extra bed option
  needsExtraBed: boolean;
  // Conditional: extra bed type only if extra bed needed
  extraBedType: 'crib' | 'rollaway' | null;

  // Special requests
  hasSpecialRequests: boolean;
  // Conditional: details only if has special requests
  specialRequestDetails: string;

  // Late checkout (simulates delay scenario from your example)
  requestLateCheckout: boolean;
  // Conditional: checkout time only if late checkout, min 12:00
  lateCheckoutTime: string;

  // Contact info
  contactEmail: string;
  contactPhone: string;

  // Payment
  paymentMethod: 'credit_card' | 'paypal' | 'invoice';
  // Conditional: credit card fields only when payment method is credit_card
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  // Conditional: company name only when payment method is invoice
  companyName: string;
  vatNumber: string;
}

// ============================================================
// Exercise 06: Async Validation + Debouncing
// ============================================================

// User profile with async validation
export interface UserProfileModel {
  // Username: async validation (check availability)
  username: string;

  // Email: async validation (check if already registered)
  email: string;

  // Promo code: async validation (verify code is valid)
  promoCode: string;

  // Display name (no async, just regular validation)
  displayName: string;

  // Bio with debounced character count
  bio: string;
}
