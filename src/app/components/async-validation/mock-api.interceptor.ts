// Fake backend for Exercise 04. Handles the /api/... requests made by validateHttp() so the
// exercise works without a server. Not part of the exercise itself.

import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, throwError } from 'rxjs';
import { MockUserService } from './mock-user.service';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const userService = inject(MockUserService);
  const url = new URL(req.url, 'http://localhost');

  switch (url.pathname) {
    // GET /api/users/check?username=... → { available: boolean }
    case '/api/users/check':
      return userService
        .checkUsernameAvailability(url.searchParams.get('username') ?? '')
        .pipe(map((available) => new HttpResponse({ status: 200, body: { available } })));

    // GET /api/emails/check?email=... → { available: boolean }
    case '/api/emails/check':
      return userService
        .checkEmailAvailability(url.searchParams.get('email') ?? '')
        .pipe(map((available) => new HttpResponse({ status: 200, body: { available } })));

    // GET /api/promo/validate?code=... → { valid: boolean; discount?: number }
    case '/api/promo/validate':
      return userService
        .validatePromoCode(url.searchParams.get('code') ?? '')
        .pipe(map((result) => new HttpResponse({ status: 200, body: result })));

    default:
      return throwError(
        () => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }),
      );
  }
};
