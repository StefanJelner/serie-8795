import { Routes } from '@angular/router';
import { SequencerComponent } from './components/sequencer/sequencer.component';

export const routes: Routes = [
  { path: '', component: SequencerComponent },
  { path: '**', redirectTo: '' },
];
