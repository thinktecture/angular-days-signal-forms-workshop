# Signal Forms Workshop Cheatsheet

> **Status:** Stable seit Angular 22 (`@angular/forms/signals`). Doku: <https://angular.dev/guide/forms/signals/overview>

## Imports

```typescript
import { signal, computed, linkedSignal } from '@angular/core';
import {
  form,
  schema,
  FormField,
  FormRoot,
  submit,
  required,
  email,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  minDate,
  maxDate,
  validate,
  validateTree,
  validateAsync,
  validateHttp,
  validateStandardSchema,
  apply,
  applyEach,
  applyWhen,
  applyWhenValue,
  disabled,
  hidden,
  readonly,
  debounce,
  metadata,
  createMetadataKey,
  type FieldTree,
  type FieldState,
  type SchemaPathTree,
  type ValidationError,
  type FormValueControl,
  type FormCheckboxControl,
} from '@angular/forms/signals';
import {
  compatForm,
  extractValue,
  SignalFormControl,
  NG_STATUS_CLASSES,
} from '@angular/forms/signals/compat';
```

---

## Grundlagen

### Form erstellen

```typescript
// 1. Signal mit Datenmodell (Single Source of Truth)
loginModel = signal({ email: '', password: '' });

// 2. Form mit Schema-Funktion (läuft einmal beim Setup)
loginForm = form(this.loginModel, (path) => {
  required(path.email);
  email(path.email);
  required(path.password);
});
```

### Template Binding

```html
<form [formRoot]="loginForm">
  <input [formField]="loginForm.email" />
  <input type="password" [formField]="loginForm.password" />
  <button type="submit" [disabled]="loginForm().submitting()">Login</button>
</form>
```

`[formField]` bindet auch `required`, `min`, `max`, `minlength`, `disabled` ... – diese Attribute nicht selbst setzen.

### FieldState

```typescript
field().value()           // WritableSignal: .set() / .update()
field().valid()           // keine Fehler UND nichts pending
field().invalid()         // Fehler vorhanden (unabhängig von pending)
field().pending()         // Async-Validierung läuft
field().errors()          // ValidationError[] (nur dieses Feld)
field().errorSummary()    // inkl. Kinder
field().getError('required') // ein Fehler, typisiert nach kind
field().touched() / dirty()
field().hidden() / disabled() / readonly() / disabledReasons()
field().submitting()      // Form-Ebene
field().reset(value?)     // touched/dirty löschen, optional Wert setzen
field().markAsTouched()   // inkl. Kinder
field().reloadValidation() // Async-Regeln neu anstoßen
field().focusBoundControl()
```

---

## Validierung

### Built-in Validators

```typescript
required(path.field, { message: 'Pflichtfeld' }); // '', null, undefined, false, NaN = leer
email(path.email);
minLength(path.password, 8);
maxLength(path.name, 50); // string oder array
min(path.age, 18);
max(path.age, 120);
minDate(path.start, new Date());
maxDate(path.end, ({ valueOf }) => valueOf(path.limit));
pattern(path.phone, /^\+49\d{10,11}$/);
// Alle akzeptieren statische Werte oder eine LogicFn: minLength(path.pw, ({ valueOf }) => valueOf(path.strict) ? 12 : 8)
```

### Custom Validator

```typescript
validate(path.city, ({ value, valueOf }) => {
  if (!ALLOWED.includes(value())) {
    return { kind: 'city', message: 'Ungültige Stadt' };
  }
  return null;
});
```

### Cross-Field Validierung

```typescript
// Fehler landet auf dem validierten Feld
validate(path.confirm, ({ value, valueOf }) =>
  value() !== valueOf(path.password)
    ? { kind: 'mismatch', message: 'Passwörter stimmen nicht überein' }
    : null,
);

// Fehler gezielt auf ein anderes Feld routen
validateTree(path, ({ valueOf, fieldTreeOf }) =>
  valueOf(path.from) === valueOf(path.to)
    ? {
        kind: 'sameLocation',
        message: 'Orte müssen unterschiedlich sein',
        fieldTree: fieldTreeOf(path.to),
      }
    : null,
);
```

### Bedingte Validierung

```typescript
// `when` an einer Regel
required(path.delay, { when: ({ valueOf }) => valueOf(path.delayed) });

// applyWhen: Regel-Gruppe (auf einem Feld oder dem Parent)
applyWhen(
  path,
  ({ valueOf }) => valueOf(path.payment) === 'card',
  (p) => {
    required(p.cardNumber);
    pattern(p.cardNumber, /^\d{16}$/);
  },
);

// applyWhenValue: Type-Narrowing per Type Guard
applyWhenValue(
  path,
  (v): v is DelayedFlight => v.delayed,
  (flight) => required(flight.delay),
);
```

### Bedingte Felder (v22: `{ when }`)

```typescript
hidden(path.vatNumber, { when: ({ valueOf }) => valueOf(path.country) !== 'DE' });
disabled(path.shipping, {
  when: ({ valueOf }) => (valueOf(path.sameAsBilling) ? 'Wie Rechnungsadresse' : false),
});
readonly(path.orderId);
// hidden/disabled/readonly: Feld zählt nicht für valid/touched/dirty des Parents
```

```html
@if (!form.vatNumber().hidden()) { <input [formField]="form.vatNumber" /> } @for (reason of
form.shipping().disabledReasons(); track reason) { <small>{{ reason.message }}</small> }
```

### Async/HTTP Validierung

```typescript
// Läuft erst, wenn alle Sync-Regeln des Felds bestanden sind
validateHttp(path.username, {
  debounce: 300, // nur diesen Request drosseln
  request: ({ value }) => (value() ? `/api/users/check?username=${value()}` : undefined),
  onSuccess: (res: { available: boolean }) =>
    res.available ? null : { kind: 'usernameTaken', message: 'Name bereits vergeben' },
  onError: () => ({ kind: 'serverError', message: 'Prüfung nicht möglich' }),
});

// Beliebige Resource (z.B. rxResource + Observable-Service)
validateAsync(path.iban, {
  params: ({ value }) => value() || undefined, // undefined = überspringen
  factory: (iban) => rxResource({ params: iban, stream: ({ params }) => this.bank.check(params) }),
  onSuccess: (ok) => (ok ? null : { kind: 'iban', message: 'IBAN ungültig' }),
  onError: () => ({ kind: 'serverError', message: 'Prüfung fehlgeschlagen' }),
});
```

### Debouncing (Model-Update verzögern)

```typescript
debounce(path.search, 300); // ms
debounce(path.username, 'blur'); // erst beim Verlassen des Felds committen
debounce(
  path.query,
  ({ value }, abortSignal) => new Promise((r) => setTimeout(r, value().length < 3 ? 500 : 200)),
);
// Touch / Submit flushen jeden Debounce sofort
```

### Zod / Standard Schema

```typescript
import * as z from 'zod';
const UserSchema = z.object({ email: z.email(), age: z.number().min(18).max(120) });
form(model, (path) => validateStandardSchema(path, UserSchema));
// dynamisch: validateStandardSchema(path, () => this.schema())
```

---

## Nested & Arrays

### Nested Objects und Schema-Wiederverwendung

```typescript
const addressSchema = schema<Address>((address) => {
  required(address.street);
  required(address.city);
});

form(model, (path) => {
  required(path.name);
  apply(path.address, addressSchema);
  apply(path.billingAddress, addressSchema);
});
```

### Arrays

```typescript
form(model, (path) => {
  minLength(path.items, 1); // required() akzeptiert leere Arrays
  applyEach(path.items, (item) => {
    // Regeln pro Element
    required(item.product);
    min(item.quantity, 1);
  });
});

// Hinzufügen / Entfernen: immutable am Model-Signal
this.model.update((m) => ({ ...m, items: [...m.items, { product: '', quantity: 1 }] }));
this.model.update((m) => ({ ...m, items: m.items.filter((_, i) => i !== index) }));
```

```html
<!-- Über den FieldTree iterieren, Tracking per Feld-Identität -->
@for (item of orderForm.items; track item; let i = $index) {
<input [formField]="item.product" />
<input type="number" [formField]="item.quantity" />
<button type="button" (click)="remove(i)">x</button>
}
```

### Subform-Komponente

```typescript
@Component({
  selector: 'app-address-form',
  imports: [FormField],
  template: `
    <input [formField]="address().street" />
    <input [formField]="address().city" />
  `,
})
export class AddressFormComponent {
  address = input.required<FieldTree<Address>>();
}
```

```html
<app-address-form [address]="userForm.address" />
```

---

## Submission

```typescript
contactForm = form(this.model, schemaFn, {
  submission: {
    action: async (field) => {
      // läuft nur, wenn valid
      const res = await this.api.save(field().value());
      if (res.ok) return; // kein Rückgabewert = Erfolg
      // Server-Fehler gezielt auf Felder routen (verschwinden beim nächsten Edit)
      return res.errors.map((e) => ({
        kind: 'server',
        message: e.message,
        fieldTree: field[e.field],
      }));
    },
    onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
    ignoreValidators: 'none', // 'pending' (Default) | 'none' | 'all'
  },
});
```

```html
<form [formRoot]="contactForm">
  <!-- novalidate + preventDefault + submit() -->
  ...
  <button type="submit" [disabled]="contactForm().submitting()">Senden</button>
</form>
```

```typescript
// Ohne FormRoot (Wizard, Auto-Save): Promise<boolean>
const ok = await submit(this.contactForm, async (field) => this.api.saveDraft(field().value()));
// Danach zurücksetzen
this.contactForm().reset(INITIAL_VALUE);
```

---

## Fehleranzeige

```html
<!-- Nach Interaktion -->
@if (form.email().touched() && form.email().invalid()) { @for (error of form.email().errors(); track
error.kind) {
<mat-error>{{ error.message }}</mat-error>
} }

<!-- Ein Fehler, typisiert -->
@if (form.password().getError('minLength'); as err) {
<div>Mindestens {{ err.minLength }} Zeichen</div>
}

<!-- Alle Fehler inkl. verschachtelter Felder -->
@for (error of form().errorSummary(); track error.kind) {
<div>{{ error.message }}</div>
}
```

---

## Signal Store Integration

```typescript
readonly store = inject(UserStore);

// Pattern A: Store liefert Daten. linkedSignal folgt dem Store, bleibt aber beschreibbar.
readonly model = linkedSignal(() => this.store.currentUser());

readonly userForm = form(this.model, (path) => {
  required(path.name);
  email(path.email);
}, {
  submission: {
    action: async (field) => {
      await this.store.updateUser(field().value());   // zurück in den Store
      field().reset();                                // dirty/touched löschen
    },
  },
});
// Ungespeicherte Änderungen: userForm().dirty()
```

---

## Custom Form Components

```typescript
@Component({
  selector: 'app-basic-input',
  template: `
    <input
      [value]="value()"
      [disabled]="disabled()"
      (input)="value.set($event.target.value)"
      (blur)="touch.emit()"
    />
    @for (e of errors(); track e.kind) {
      <small>{{ e.message }}</small>
    }
  `,
})
export class BasicInput implements FormValueControl<string> {
  value = model(''); // Pflicht
  disabled = input(false); // optional, wird gebunden
  errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  touched = input(false); // v22: Input ...
  touch = output<void>(); // ... + Output statt Model
}
// Checkbox: FormCheckboxControl mit checked = model(false)
// UI-String ↔ Model-Zahl: transformedValue(this.value, { parse, format })
// Kein CVA nötig; CVA-Komponenten funktionieren trotzdem mit [formField]
```

---

## Migration

```typescript
// Top-down: bestehende Controls im Model-Signal nesten
const user = signal({ email: '', password: passwordControl, address: addressGroup });
const f = compatForm(user, (p) => required(p.email));
f.password().errors(); // CompatValidationError (kind = Reactive-Key, context = Wert, keine message)
extractValue(f); // Model ohne Control-Objekte

// Bottom-up: Signal-Feld in einer FormGroup
emailControl = new SignalFormControl('', (p) => required(p));
group = new FormGroup({ name: new FormControl(''), email: this.emailControl });
// <input [formField]="emailControl.fieldTree" />

// ng-valid / ng-touched Klassen zurückholen
provideSignalFormsConfig({ classes: NG_STATUS_CLASSES });
```

---

## Metadata

```typescript
export const HINT = createMetadataKey<string>();
form(model, (path) => metadata(path.email, HINT, () => 'Geschäftliche E-Mail'));
// Built-in: REQUIRED, MIN, MAX, MIN_LENGTH, MAX_LENGTH, PATTERN → field().metadata(MIN_LENGTH)
```

```html
@let hint = form.email().metadata(HINT)?.();
```

---

## Workshop Commands

```bash
npm run start           # Dev Server (Port 4200)
npm run build           # Build (inkl. Lösungen)
npm run test            # Tests
npx prettier --write .  # Formatieren
```

---

## Vergleich: Reactive Forms vs Signal Forms

| Aspekt          | Reactive Forms              | Signal Forms                                  |
| --------------- | --------------------------- | --------------------------------------------- |
| Reaktivität     | RxJS Observables            | Angular Signals                               |
| Source of Truth | FormGroup-Baum              | Model-Signal                                  |
| Boilerplate     | FormBuilder, FormGroup, CVA | `form()`, `[formField]`, Schema-Funktion      |
| Type Safety     | Manuell                     | Aus dem Modell abgeleitet                     |
| Validierung     | Validators am Control       | Deklarative Regeln, komponierbar (`schema()`) |
| Submission      | `(ngSubmit)` + manuell      | `[formRoot]` + `submission.action`            |
| Status          | Stable                      | Stable seit v22                               |
