import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
} from '@angular/core';
import { DEFAULT_IMPORTS } from '../../default-imports';
import { SchedulerService } from '../../services/scheduler/scheduler.service';
import { Track } from '../../services/track-state/track-state.service';
import { NoteSelectorComponent } from '../note-selector/note-selector.component';

@Component({
  selector: 'app-track',
  imports: [...DEFAULT_IMPORTS, NoteSelectorComponent],
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TrackComponent {
  public readonly number = input.required<number>();
  public readonly track = input.required<Track>();

  private readonly _schedulerService: SchedulerService =
    inject(SchedulerService);

  public setActive(active: boolean): void {
    this._schedulerService.setTrackActive(this.number(), active);
  }

  public setSolo(solo: boolean): void {
    this._schedulerService.setTrackSolo(this.number(), solo);
  }

  public setMute(mute: boolean): void {
    this._schedulerService.setTrackMute(this.number(), mute);
  }
}
