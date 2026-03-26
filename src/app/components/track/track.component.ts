import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
} from '@angular/core';
import { DEFAULT_IMPORTS } from '../../default-imports';
import { SchedulerService } from '../../services/scheduler/scheduler.service';
import {
  Track,
  TrackStateService,
} from '../../services/track-state/track-state.service';
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

  public readonly minSwing = TrackStateService.MIN_SWING;
  public readonly maxSwing = TrackStateService.MAX_SWING;
  public readonly minHumanize = TrackStateService.MIN_HUMANIZE;
  public readonly maxHumanize = TrackStateService.MAX_HUMANIZE;

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

  public setSwing(swing: number): void {
    this._schedulerService.setTrackSwing(this.number(), swing);
  }

  public setHumanize(humanize: number): void {
    this._schedulerService.setTrackHumanize(this.number(), humanize);
  }
}
