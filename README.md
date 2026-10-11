# Angular Signal Forms Workshop

[Angular Days 2026](https://javascript-days.de/angular), Berlin, October 2026

Trainer: Sascha Lehmann ([@derLehmann_S](https://twitter.com/derLehmann_S)) ([Thinktecture](https://www.thinktecture.com/thinktects/sascha-lehmann/))

With Angular 22, Signal Forms (`@angular/forms/signals`) are stable: a model-first, signal-based forms API that
closes the gap between forms and the reactive core of the framework. In this hands-on workshop you migrate
Template-Driven and Reactive Forms step by step, implement conditional and asynchronous validation, build dynamic
forms from data and connect forms to an NgRx SignalStore.

## Prerequisites

- Basic understanding of Angular and TypeScript
- Familiarity with Angular Signals (`signal()`, `computed()`, `linkedSignal()`)
- Experience with either Template-Driven Forms or Reactive Forms

## Setup Instructions

Please bring your laptop with the following installed:

- [Node.js](https://nodejs.org/) (v22.22 or v24.15 and newer, as required by Angular CLI 22)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) or [WebStorm](https://www.jetbrains.com/webstorm/)
- [Google Chrome](https://www.google.com/chrome/)

Unrestricted internet access is required (no corporate proxies or firewalls). If in doubt, please bring your
personal laptop.

After cloning the repository, run the following commands:

```sh
npm install
npm start
```

Navigate to `http://localhost:4200` in your browser.

## Tech Stack

| Package                    | Version |
| -------------------------- | ------- |
| Angular (core, forms, CLI) | 22.2    |
| Angular Material           | 22.2    |
| NgRx Signals               | 22.0    |
| TypeScript                 | 6.0     |
| Vitest                     | 5.0     |

## Workshop Structure

The workshop consists of six exercises:

| Exercise | Topic                   | Description                                                                   |
| -------- | ----------------------- | ----------------------------------------------------------------------------- |
| 01       | Template to Signal Form | Migrate a Template-Driven Form: model signal, schema, FormRoot                |
| 02       | Reactive to Signal Form | Partial migration with `compatForm()`: keep a `FormControl`, migrate the rest |
| 03       | Conditional Validation  | `hidden()`, `when`, `applyWhen()`, `applyEach()`, cross-field rules           |
| 04       | Async Validation        | `validateHttp()` / `validateAsync()` with debouncing and `pending()`          |
| 05       | Signal Form with Store  | `linkedSignal()` + submission action with an NgRx SignalStore                 |
| 06       | Dynamic JSON Form       | Generate a form from a JSON definition (Forms over Data) and extend it        |

Each exercise includes:

- A `README.md` with step-by-step tasks and collapsible solutions
- A `template/` folder: a pristine copy of the starting point (restore with `git checkout` or copy it back)
- A `solution/` folder: the complete implementation

The starting points you edit live in `src/app/components/`. The solutions are compiled with the app and run at
`http://localhost:4200/solutions/<route>` (linked from the home page), so you can compare at any time.

## Getting Started

Open `exercises/01-template-to-signal-form/README.md` and start with the first exercise.
`exercises/cheatsheet.md` summarizes the API.

## Resources

- [Signal Forms Overview](https://angular.dev/guide/forms/signals/overview)
- [Signal Forms Validation](https://angular.dev/guide/forms/signals/validation)
- [Form Submission](https://angular.dev/guide/forms/signals/form-submission)
- [Migrating to Signal Forms](https://angular.dev/guide/forms/signals/migration)
- [Angular Signals](https://angular.dev/guide/signals)
- [NgRx SignalStore](https://ngrx.io/guide/signals/signal-store)

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.
