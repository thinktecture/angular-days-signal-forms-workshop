import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FieldDefinition, FormDefinition, FORM_DEFINITION } from './form-definition';

@Component({
  selector: 'app-dynamic-json-form',
  templateUrl: './dynamic-json-form.component.html',
  styleUrl: './dynamic-json-form.component.scss',
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicJsonFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly definition = signal<FormDefinition>(FORM_DEFINITION);

  dynamicForm!: FormGroup;

  readonly submitted = signal(false);
  readonly submittedData = signal<Record<string, unknown> | null>(null);

  ngOnInit(): void {
    this.buildForm();
  }

  // Build form dynamically from definition
  private buildForm(): void {
    const formControls: Record<string, unknown> = {};

    for (const field of this.definition().fields) {
      const validators = this.getValidators(field);
      const initialValue = this.getInitialValue(field);
      formControls[field.name] = [initialValue, validators];
    }

    this.dynamicForm = this.fb.group(formControls);
  }

  // Get validators based on field definition
  private getValidators(field: FieldDefinition): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }
    if (field.minLength) {
      validators.push(Validators.minLength(field.minLength));
    }
    if (field.maxLength) {
      validators.push(Validators.maxLength(field.maxLength));
    }
    if (field.min !== undefined) {
      validators.push(Validators.min(field.min));
    }
    if (field.max !== undefined) {
      validators.push(Validators.max(field.max));
    }
    if (field.type === 'email') {
      validators.push(Validators.email);
    }

    return validators;
  }

  // Get initial value based on field type
  private getInitialValue(field: FieldDefinition): unknown {
    switch (field.type) {
      case 'checkbox':
        return false;
      case 'number':
        return null;
      default:
        return '';
    }
  }

  // Get icon for field type
  getFieldIcon(type: string): string {
    const icons: Record<string, string> = {
      text: 'text_fields',
      email: 'email',
      number: 'numbers',
      textarea: 'notes',
      select: 'list',
      checkbox: 'check_box',
    };
    return icons[type] || 'input';
  }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      this.submitted.set(true);
      this.submittedData.set(this.dynamicForm.value);
      console.log('Form submitted:', this.submittedData());
    } else {
      this.dynamicForm.markAllAsTouched();
    }
  }

  onReset(): void {
    this.dynamicForm.reset();
    for (const field of this.definition().fields) {
      const initialValue = this.getInitialValue(field);
      this.dynamicForm.get(field.name)?.setValue(initialValue);
    }
    this.submitted.set(false);
    this.submittedData.set(null);
  }

  hasError(controlName: string): boolean {
    const control = this.dynamicForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: FieldDefinition): string {
    const control = this.dynamicForm.get(field.name);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return `${field.label} is required`;
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;

    return 'Invalid value';
  }
}
