import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ExerciseCard {
  title: string;
  description: string;
  route: string;
  icon: string;
  exerciseNumber: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly exercises: ExerciseCard[] = [
    {
      title: 'Template to Signal Form',
      description: 'Migrate a template-driven form to the new Angular Signal Forms API.',
      route: '/template-form',
      icon: 'edit_note',
      exerciseNumber: '01',
    },
    {
      title: 'Reactive to Signal Form',
      description: 'Convert a complex Reactive Form with nested groups and arrays to Signal Forms.',
      route: '/reactive-form',
      icon: 'dynamic_form',
      exerciseNumber: '02',
    },
    {
      title: 'Conditional Validation',
      description: 'Implement conditional validation with applyWhenValue in a hotel booking form.',
      route: '/hotel-booking',
      icon: 'hotel',
      exerciseNumber: '03',
    },
    {
      title: 'Async Validation',
      description: 'Add async validators with built-in debouncing for username availability checks.',
      route: '/async-validation',
      icon: 'cloud_sync',
      exerciseNumber: '04',
    },
    {
      title: 'Signal Form with Store',
      description: 'Integrate Signal Forms with NgRx SignalStore using linkedSignal.',
      route: '/store-form',
      icon: 'storage',
      exerciseNumber: '05',
    },
    {
      title: 'Dynamic JSON Form',
      description: 'Build forms dynamically from JSON schema definitions (Forms over Data).',
      route: '/dynamic-json-form',
      icon: 'data_object',
      exerciseNumber: '06',
    },
  ];
}
