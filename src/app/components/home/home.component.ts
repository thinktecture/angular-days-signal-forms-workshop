import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface ExerciseCard {
  title: string;
  description: string;
  route: string;
  solutionRoute: string;
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
      description:
        'Migrate a template-driven form to Signal Forms: model signal, schema, FormRoot.',
      route: '/template-form',
      solutionRoute: '/solutions/template-form',
      icon: 'edit_note',
      exerciseNumber: '01',
    },
    {
      title: 'Reactive to Signal Form',
      description:
        'Partially migrate a Reactive Form with compatForm(): keep a FormControl, migrate the rest.',
      route: '/reactive-form',
      solutionRoute: '/solutions/reactive-form',
      icon: 'dynamic_form',
      exerciseNumber: '02',
    },
    {
      title: 'Conditional Validation',
      description:
        'hidden(), the when option, applyWhen() and applyEach() in a hotel booking form.',
      route: '/hotel-booking',
      solutionRoute: '/solutions/hotel-booking',
      icon: 'hotel',
      exerciseNumber: '03',
    },
    {
      title: 'Async Validation',
      description: 'validateHttp() and validateAsync() with debouncing and pending() state.',
      route: '/async-validation',
      solutionRoute: '/solutions/async-validation',
      icon: 'cloud_sync',
      exerciseNumber: '04',
    },
    {
      title: 'Signal Form with Store',
      description:
        'Connect a Signal Form to an NgRx SignalStore with linkedSignal() and a submission action.',
      route: '/store-form',
      solutionRoute: '/solutions/store-form',
      icon: 'storage',
      exerciseNumber: '05',
    },
    {
      title: 'Dynamic JSON Form',
      description: 'Generate a form from a JSON definition (Forms over Data) and extend it.',
      route: '/dynamic-json-form',
      solutionRoute: '/solutions/dynamic-json-form',
      icon: 'data_object',
      exerciseNumber: '06',
    },
  ];
}
