import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MockUserService {
  // Simulate checking if username is available
  // Returns false if username is "taken", "admin", "user", or "test"
  checkUsernameAvailability(username: string): Observable<boolean> {
    const takenUsernames = ['taken', 'admin', 'user', 'test', 'demo'];
    return timer(800).pipe(
      // Simulate network delay
      map(() => !takenUsernames.includes(username.toLowerCase()))
    );
  }

  // Simulate checking if email is already registered
  checkEmailAvailability(email: string): Observable<boolean> {
    const registeredEmails = ['test@example.com', 'admin@example.com', 'user@example.com'];
    return timer(600).pipe(map(() => !registeredEmails.includes(email.toLowerCase())));
  }

  // Simulate validating a promo code
  validatePromoCode(code: string): Observable<{ valid: boolean; discount?: number }> {
    const validCodes: Record<string, number> = {
      SAVE10: 10,
      SAVE20: 20,
      WELCOME: 15,
      VIP50: 50,
    };
    return timer(500).pipe(
      map(() => {
        const discount = validCodes[code.toUpperCase()];
        return discount ? { valid: true, discount } : { valid: false };
      })
    );
  }
}
