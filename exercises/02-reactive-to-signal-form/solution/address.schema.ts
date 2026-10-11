// Reusable schema for the nested address object.
// Schemas are plain functions: keep them in their own file and apply() them wherever needed.

import { pattern, required, schema } from '@angular/forms/signals';
import { Address } from '@app/models/forms.models';

export const addressSchema = schema<Address>((address) => {
  required(address.street, { message: 'Street is required' });
  required(address.city, { message: 'City is required' });
  required(address.postalCode, { message: 'Postal code is required' });
  pattern(address.postalCode, /^\d{5}$/, { message: 'Postal code must be 5 digits' });
  required(address.country, { message: 'Country is required' });
});
