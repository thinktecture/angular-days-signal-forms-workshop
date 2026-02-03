# Angular Signal Forms Workshop

[Angular Days 2026](https://javascript-days.de/angular), March 2026

Trainer: Sascha Lehmann ([@derLehmann_S](https://twitter.com/derLehmann_S)) ([Thinktecture](https://www.thinktecture.com/thinktects/sascha-lehmann/))

Angular 21 introduces Signal Forms - a modern, signal-based approach to form handling that eliminates the complexity of traditional Template-Driven and Reactive Forms. In this hands-on workshop, Sascha Lehmann, Consultant at Thinktecture AG, demonstrates how to leverage Signal Forms for cleaner, more reactive form development.

In this workshop, you will build several form components using the new `@angular/forms/signals` API. You'll learn how to migrate existing forms, implement complex validation scenarios, integrate with state management, and create dynamic forms - all using modern Angular patterns like standalone components and signals.

## Prerequisites

- Basic understanding of Angular and TypeScript
- Familiarity with Angular Signals (`signal()`, `computed()`, `effect()`)
- Experience with either Template-Driven Forms or Reactive Forms

## Setup Instructions

Please bring your laptop with the following installed:

- [Node.js](https://nodejs.org/) (v20+)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) or [WebStorm](https://www.jetbrains.com/webstorm/)
- [Google Chrome](https://www.google.com/chrome/)

Unrestricted internet access is required (no corporate proxies or firewalls). If in doubt, please bring your personal laptop.

After cloning the repository, run the following commands:

```sh
npm install
npm start
```

Navigate to `http://localhost:4200` in your browser.

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

## Workshop Structure

The workshop consists of six exercises, each building on the previous:

| Exercise | Topic | Description |
|----------|-------|-------------|
| 01 | Template to Signal Form | Migrate a Template-Driven Form to Signal Forms |
| 02 | Reactive to Signal Form | Convert a complex Reactive Form with nested objects and arrays |
| 03 | Conditional Validation | Implement validators that apply based on field values |
| 04 | Async Validation | Add server-side validation with debouncing and loading states |
| 05 | Signal Form with Store | Integrate Signal Forms with NgRx SignalStore |
| 06 | Dynamic JSON Form | Generate forms dynamically from JSON definitions |

Each exercise includes:

- A `README.md` with detailed instructions
- A `template/` folder with starter code
- A `solution/` folder with a complete implementation

## Getting Started

Navigate to `signal-forms-workshop/exercises/01-template-to-signal-form/` and read the README.md to begin the first exercise.

## Resources

- [Angular Signal Forms RFC](https://github.com/angular/angular/discussions/55825)
- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [NgRx SignalStore Documentation](https://ngrx.io/guide/signals/signal-store)
