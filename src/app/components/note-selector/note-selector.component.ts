import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
} from '@angular/core';
import { DEFAULT_IMPORTS } from '../../default-imports';
import { MaxSemitonePipe } from '../../pipes/max-semitone.pipe';
import { SchedulerService } from '../../services/scheduler/scheduler.service';
import { TrackStateService } from '../../services/track-state/track-state.service';
import { DurationSelectorComponent } from '../duration-selector/duration-selector.component';

@Component({
  selector: 'app-note-selector',
  imports: [...DEFAULT_IMPORTS, MaxSemitonePipe, DurationSelectorComponent],
  templateUrl: './note-selector.component.html',
  styleUrls: ['./note-selector.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NoteSelectorComponent {
  public readonly trackNumber = input.required<number>();
  public readonly stepNumber = input.required<number>();
  public octave = input<number | null>(null);
  public semitone = input<number | null>(null);
  public velocity = input<number>(TrackStateService.DEFAULT_VELOCITY);
  public step = input<number>(TrackStateService.DEFAULT_DURATION_STEP);
  public numerator = input<number>(
    TrackStateService.DEFAULT_DURATION_NUMERATOR,
  );
  public denominator = input<number>(
    TrackStateService.DEFAULT_DURATION_DENOMINATOR,
  );

  public readonly octaves = TrackStateService.getOctaves();
  public readonly semitones = TrackStateService.getSemitones();
  public readonly maxVelocity = TrackStateService.MAX_VELOCITY;
  public readonly minVelocity = TrackStateService.MIN_VELOCITY;

  private readonly _schedulerService: SchedulerService =
    inject(SchedulerService);

  public setOctave(octave: string) {
    const octaveInt = parseInt(octave);

    if (
      isNaN(octaveInt) ||
      octaveInt < TrackStateService.MIN_OCTAVE ||
      octaveInt > TrackStateService.MAX_OCTAVE
    ) {
      return;
    }

    this._schedulerService.setOctave(
      this.trackNumber(),
      this.stepNumber(),
      octaveInt,
    );
  }

  public setSemitone(semitone: string) {
    const semitoneInt = parseInt(semitone);

    if (
      isNaN(semitoneInt) ||
      semitoneInt < TrackStateService.MIN_SEMITONE ||
      semitoneInt > TrackStateService.MAX_SEMITONE
    ) {
      return;
    }

    this._schedulerService.setSemitone(
      this.trackNumber(),
      this.stepNumber(),
      semitoneInt,
    );
  }

  public setVelocity(velocity: string) {
    const velocityInt = parseInt(velocity);

    if (
      isNaN(velocityInt) ||
      velocityInt < TrackStateService.MIN_VELOCITY ||
      velocityInt > TrackStateService.MAX_VELOCITY
    ) {
      return;
    }

    this._schedulerService.setVelocity(
      this.trackNumber(),
      this.stepNumber(),
      velocityInt,
    );
  }
}
