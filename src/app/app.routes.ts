import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  // Exercise 01: Template-Driven Form
  {
    path: 'template-form',
    loadComponent: () =>
      import('./components/template-form/template-form.component').then(
        (m) => m.TemplateFormComponent
      ),
  },
  // Exercise 02: Reactive Form (Registration)
  {
    path: 'reactive-form',
    loadComponent: () =>
      import('./components/reactive-form/reactive-form.component').then(
        (m) => m.ReactiveFormComponent
      ),
  },
  // Exercise 03: Signal Form with Store
  {
    path: 'store-form',
    loadComponent: () =>
      import('./components/store-form/store-form.component').then(
        (m) => m.StoreFormComponent
      ),
  },
  // Exercise 04: Dynamic JSON Form
  {
    path: 'dynamic-json-form',
    loadComponent: () =>
      import('./components/dynamic-json-form/dynamic-json-form.component').then(
        (m) => m.DynamicJsonFormComponent
      ),
  },
  // Exercise 05: Conditional Validation (Hotel Booking)
  {
    path: 'hotel-booking',
    loadComponent: () =>
      import('./components/hotel-booking/hotel-booking.component').then(
        (m) => m.HotelBookingComponent
      ),
  },
  // Exercise 06: Async Validation + Debouncing
  {
    path: 'async-validation',
    loadComponent: () =>
      import('./components/async-validation/async-validation.component').then(
        (m) => m.AsyncValidationComponent
      ),
  },
];
