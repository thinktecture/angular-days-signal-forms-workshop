# Signal Forms Workshop Cheatsheet

> **Status:** Experimentell (Angular 21+) - API kann sich ändern

## Imports

```typescript
import { signal, computed } from '@angular/core';
import {
  form, FormField, schema, validate,
  required, email, minLength, maxLength, min, max, pattern,
  apply, applyEach, applyWhenValue,
  validateHttp, validateStandardSchema,
  disabled, hidden, readonly, debounce,
  metadata, createMetadataKey, submit
} from '@angular/forms/signals';
```

---

## Grundlagen

### Form erstellen

```typescript
// 1. Signal mit Datenmodell
loginModel = signal({ email: '', password: '' });

// 2. Form mit Validierung
loginForm = form(this.loginModel, (path) => {
  required(path.email);
  email(path.email);
  required(path.password);
});
```

### Template Binding

```html
<input [formField]="loginForm.email" />
<input type="password" [formField]="loginForm.password" />
```

### FieldTree State

```typescript
field().value()      // Aktueller Wert
field().valid()      // boolean
field().errors()     // ValidationError[]
field().dirty()      // Wurde modifiziert?
field().pristine()   // Nicht modifiziert (Gegenteil von dirty)
field().touched()    // Wurde fokussiert/verlassen?
field().pending()    // Async-Validierung läuft?
field().hidden()     // Ist versteckt?
field().disabled()   // Ist deaktiviert?
```

---

## Validierung

### Built-in Validators

```typescript
required(path.field, { message: 'Pflichtfeld' });
email(path.email);
minLength(path.password, 8);
maxLength(path.name, 50);
min(path.age, 18);
max(path.age, 120);
pattern(path.phone, /^\+49\d{10,11}$/);
```

### Custom Validator

```typescript
function validateCity(path: SchemaPathTree<string>, allowed: string[]) {
  validate(path, (ctx) => {
    if (!allowed.includes(ctx.value())) {
      return { kind: 'city', message: 'Ungültige Stadt', allowed };
    }
    return null;
  });
}
```

### Bedingte Validierung

```typescript
// Option 1: applyWhenValue
applyWhenValue(path, (val) => val.delayed, (path) => {
  required(path.delay);
});

// Option 2: when Parameter
required(path.delay, {
  when: (ctx) => ctx.valueOf(path.delayed)
});
```

### Cross-Field Validierung

```typescript
validate(schema, (ctx) => {
  const from = ctx.valueOf(schema.from);
  const to = ctx.valueOf(schema.to);
  if (from === to) {
    return { kind: 'same_location', message: 'Orte müssen unterschiedlich sein' };
  }
  return null;
});
```

### Async/HTTP Validierung

```typescript
validateHttp(path.username, {
  request: (ctx) => ({
    url: '/api/users/check',
    params: { username: ctx.value() }
  }),
  onSuccess: (result: { available: boolean }) =>
    result.available ? null : { kind: 'taken', message: 'Bereits vergeben' },
  onError: () => ({ kind: 'api_error' })
});
```

### Zod Integration

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

form(model, (path) => {
  validateStandardSchema(path, UserSchema);
});
```

---

## Nested & Arrays

### Nested Objects

```typescript
const addressSchema = schema<Address>((path) => {
  required(path.street);
  required(path.city);
});

const userSchema = schema<User>((path) => {
  required(path.name);
  apply(path.address, addressSchema);
});
```

```html
<input [formField]="userForm.address.street" />
<input [formField]="userForm.address.city" />
```

### Form Arrays

```typescript
form(model, (path) => {
  applyEach(path.items, itemSchema);
});
```

```html
@for (item of orderForm.items; track $index) {
  <input [formField]="item.product" />
  <input type="number" [formField]="item.quantity" />
}
```

```typescript
// Element hinzufügen
this.model.update(m => ({
  ...m,
  items: [...m.items, { product: '', quantity: 1 }]
}));
```

---

## Form-Steuerung

### Werte aktualisieren

```typescript
// Gesamtes Modell
this.model.set({ name: 'Max', email: 'max@example.com' });

// Partielles Update
this.model.update(prev => ({ ...prev, email: 'neu@email.de' }));

// Einzelnes Feld
this.form.email().value.set('');
```

### Reset & Touch

```typescript
// Formular zurücksetzen
this.form.reset();

// Alle Felder als touched markieren (für Submit-Validierung)
this.form.markAllAsTouched();
```

### Feld-Zustände

```typescript
// Deaktivieren
disabled(path.field, (ctx) => ctx.valueOf(path.other) ? "Grund" : false);

// Verstecken (Template muss reagieren)
hidden(path.field, (ctx) => ctx.valueOf(path.country) !== 'DE');

// Readonly
readonly(path.orderId);

// Debouncing
debounce(path.searchTerm, 300);
```

---

## Submit & Fehler

### Submit mit Error-Handling

```typescript
import { submit } from '@angular/forms/signals';

async save() {
  await submit(this.form, async (form) => {
    try {
      await this.api.save(form().value());
      return null;
    } catch (error) {
      return { kind: 'server_error', message: 'Speichern fehlgeschlagen' };
    }
  });
}
```

### Fehleranzeige

```html
<!-- Einzelnes Feld -->
@if (form.email().errors().length) {
  @for (error of form.email().errors(); track error.kind) {
    <span class="error">{{ error.message }}</span>
  }
}

<!-- Alle Fehler (inkl. nested) -->
@for (error of form().errorSummary(); track error.kind) {
  <div class="error">{{ error.message }}</div>
}
```

---

## Subforms & Wiederverwendung

### Subform-Komponente

```typescript
@Component({
  selector: 'app-address-form',
  imports: [FormField],
  template: `
    <input [formField]="address().street" />
    <input [formField]="address().city" />
  `
})
export class AddressFormComponent {
  address = input.required<FieldTree<Address>>();
}
```

```html
<app-address-form [address]="userForm.address" />
<app-address-form [address]="userForm.billingAddress" />
```

### Schema-Komposition

```typescript
// base-schema.ts
export const baseUserSchema = schema<User>((path) => {
  required(path.email);
  email(path.email);
});

// extended-schema.ts
export const registrationSchema = schema<User>((path) => {
  apply(path, baseUserSchema);
  required(path.password);
  minLength(path.password, 12);
});
```

---

## Metadata

```typescript
import { createMetadataKey, metadata } from '@angular/forms/signals';

export const MIN_LENGTH = createMetadataKey<number>();

function validatePassword(path: SchemaPathTree<string>) {
  metadata(path, MIN_LENGTH, () => 12);
  minLength(path, 12);
}
```

```html
@let minLen = form.password().metadata(MIN_LENGTH)?.();
<span>Mindestens {{ minLen }} Zeichen</span>
```

---

## Workshop Commands

```bash
npm run start      # Dev Server (Port 4200)
npm run build      # Build
npm run test       # Tests
npx prettier --write .  # Formatieren
```

---

## Vergleich: Reactive Forms vs Signal Forms

| Aspekt | Reactive Forms | Signal Forms |
|--------|----------------|--------------|
| Reaktivität | RxJS Observables | Angular Signals |
| Boilerplate | FormBuilder, FormGroup | `form()`, direktes Binding |
| Type Safety | Manuell | Automatisch aus Modell |
| Subscriptions | `valueChanges.subscribe()` | Auto-tracking |
| Status | Produktionsreif | Experimentell |
