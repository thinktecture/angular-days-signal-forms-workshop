// Solution for Exercise 06: Dynamic JSON Form ("Forms over Data")

//
// The form is generated from FORM_DEFINITION (form-definition.ts): model, rules and controls.
// The definition (form-definition.ts) now contains the phone field and supports `pattern`.

import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Field, FormField, FormRoot, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  DynamicFormModel,
  FORM_DEFINITION,
  applyFieldRules,
  createInitialModel,
} from './form-definition';

@Component({
  selector: 'app-dynamic-json-form-solution',
  templateUrl: './dynamic-json-form.component.html',
  styleUrl: './dynamic-json-form.component.scss',
  imports: [
    FormField,
    FormRoot,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicJsonFormSolutionComponent {
  // The definition drives everything below
  readonly definition = FORM_DEFINITION;

  // 1. Model: generated from the definition
  readonly formModel = signal<DynamicFormModel>(createInitialModel(this.definition));
  readonly submittedData = signal<DynamicFormModel | null>(null);

  // 2. Rules: generated from the definition (the schema function runs once, at setup)
  readonly dynamicForm = form(
    this.formModel,
    (path) => {
      for (const field of this.definition.fields) {
        applyFieldRules(path, field);
      }
    },
    {
      submission: {
        action: async (field) => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          this.submittedData.set(field().value());
          console.log('Form submitted:', field().value());
        },
        onInvalid: (field) => field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  // 3. Controls: the template looks up the field by name.
  //    The FieldTree has no static keys either, so the lookup is a cast. Native inputs are
  //    type-checked against the field's value type, so the helpers narrow it per control.
  fieldFor(name: string): Field<unknown> {
    return this.lookup<unknown>(name);
  }

  inputFieldFor(name: string): Field<string | number | null> {
    return this.lookup<string | number | null>(name);
  }

  textareaFieldFor(name: string): Field<string> {
    return this.lookup<string>(name);
  }

  private lookup<T>(name: string): Field<T> {
    return (this.dynamicForm as unknown as Record<string, Field<T>>)[name];
  }

  fieldIcon(type: string): string {
    const icons: Record<string, string> = {
      text: 'text_fields',
      email: 'email',
      number: 'numbers',
      textarea: 'notes',
      select: 'list',
      checkbox: 'check_box',
    };
    return icons[type] ?? 'input';
  }

  onReset(): void {
    this.dynamicForm().reset(createInitialModel(this.definition));
    this.submittedData.set(null);
  }
}
