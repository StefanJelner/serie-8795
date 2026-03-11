import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
} from '@angular/core';
import { Track } from '../../models/scheduler.models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SchedulerService } from '../../services/scheduler/scheduler.service';
import { NoteSelectorComponent } from '../note-selector/note-selector.component';

@Component({
  selector: 'app-track',
  imports: [CommonModule, NoteSelectorComponent, TranslatePipe],
  templateUrl: './track.component.html',
  styleUrl: './track.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TrackComponent {
  public readonly number = input.required<number>();
  public readonly track = input.required<Track>();

  private readonly _schedulerService: SchedulerService =
    inject(SchedulerService);

  public updateNote(track: number, step: number, note: number | null) {
    this._schedulerService.setNote(track, step, note);
  }
}
