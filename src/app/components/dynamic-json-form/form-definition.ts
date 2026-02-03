export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'checkbox' | 'select';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

export interface FormDefinition {
  title: string;
  fields: FieldDefinition[];
}

export const FORM_DEFINITION: FormDefinition = {
  title: 'Contact Form',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      minLength: 2,
      placeholder: 'Enter your first name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      minLength: 2,
      placeholder: 'Enter your last name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'your.email@example.com',
    },
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      min: 18,
      max: 120,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
      ],
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
      maxLength: 500,
      placeholder: 'Tell us about yourself...',
    },
    {
      name: 'newsletter',
      label: 'Subscribe to newsletter',
      type: 'checkbox',
    },
  ],
};
