// This component is used in Exercise 01
// Files: signal-forms-workshop/exercises/01-template-to-signal-form/*

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { TemplateToSignalFormModel } from '../../models/forms.models';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrl: './template-form.component.scss',
  imports: [
    FormsModule,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateFormComponent {
  // Exercise 01: Convert this template-driven form to Signal Forms
  // See: signal-forms-workshop/exercises/01-template-to-signal-form/README.md

  formData: TemplateToSignalFormModel = {
    name: '',
    email: '',
    age: null,
    newsletter: false,
  };

  submitted = false;
  submittedData: TemplateToSignalFormModel | null = null;

  onSubmit(): void {
    this.submitted = true;
    this.submittedData = { ...this.formData };
    console.log('Form submitted:', this.submittedData);
  }

  onReset(form: NgForm): void {
    form.resetForm();
    this.formData = {
      name: '',
      email: '',
      age: null,
      newsletter: false,
    };
    this.submitted = false;
    this.submittedData = null;
  }
}
