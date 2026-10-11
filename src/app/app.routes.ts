import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },

  // ============================================================
  // Exercises (starting points, edit these during the workshop)
  // ============================================================

  // Exercise 01: Template-Driven Form → Signal Forms
  {
    path: 'template-form',
    loadComponent: () =>
      import('./components/template-form/template-form.component').then(
        (m) => m.TemplateFormComponent,
      ),
  },
  // Exercise 02: Reactive Form → Signal Forms (partial migration with compatForm)
  {
    path: 'reactive-form',
    loadComponent: () =>
      import('./components/reactive-form/reactive-form.component').then(
        (m) => m.ReactiveFormComponent,
      ),
  },
  // Exercise 03: Conditional Validation (Hotel Booking)
  {
    path: 'hotel-booking',
    loadComponent: () =>
      import('./components/hotel-booking/hotel-booking.component').then(
        (m) => m.HotelBookingComponent,
      ),
  },
  // Exercise 04: Async Validation
  {
    path: 'async-validation',
    loadComponent: () =>
      import('./components/async-validation/async-validation.component').then(
        (m) => m.AsyncValidationComponent,
      ),
  },
  // Exercise 05: Signal Form with NgRx SignalStore
  {
    path: 'store-form',
    loadComponent: () =>
      import('./components/store-form/store-form.component').then((m) => m.StoreFormComponent),
  },
  // Exercise 06: Dynamic JSON Form
  {
    path: 'dynamic-json-form',
    loadComponent: () =>
      import('./components/dynamic-json-form/dynamic-json-form.component').then(
        (m) => m.DynamicJsonFormComponent,
      ),
  },

  // ============================================================
  // Solutions (reference implementations from exercises/*/solution)
  // ============================================================
  {
    path: 'solutions/template-form',
    loadComponent: () =>
      import('@exercises/01-template-to-signal-form/solution/template-form-solution.component').then(
        (m) => m.TemplateFormSolutionComponent,
      ),
  },
  {
    path: 'solutions/reactive-form',
    loadComponent: () =>
      import('@exercises/02-reactive-to-signal-form/solution/reactive-form-solution.component').then(
        (m) => m.ReactiveFormSolutionComponent,
      ),
  },
  {
    path: 'solutions/hotel-booking',
    loadComponent: () =>
      import('@exercises/03-conditional-validation/solution/hotel-booking.component').then(
        (m) => m.HotelBookingSolutionComponent,
      ),
  },
  {
    path: 'solutions/async-validation',
    loadComponent: () =>
      import('@exercises/04-async-validation/solution/async-validation.component').then(
        (m) => m.AsyncValidationSolutionComponent,
      ),
  },
  {
    path: 'solutions/store-form',
    loadComponent: () =>
      import('@exercises/05-signal-form-with-store/solution/store-form.component').then(
        (m) => m.StoreFormSolutionComponent,
      ),
  },
  {
    path: 'solutions/feedback-form',
    loadComponent: () =>
      import('@exercises/05-signal-form-with-store/solution/feedback-form.component').then(
        (m) => m.FeedbackFormSolutionComponent,
      ),
  },
  {
    path: 'solutions/dynamic-json-form',
    loadComponent: () =>
      import('@exercises/06-dynamic-json-form/solution/dynamic-json-form.component').then(
        (m) => m.DynamicJsonFormSolutionComponent,
      ),
  },
];
