import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  output,
} from '@angular/core';
import { DEFAULT_IMPORTS } from '../../default-imports';
import { SchedulerService } from '../../services/scheduler/scheduler.service';
import { TrackStateService } from '../../services/track-state/track-state.service';

@Component({
  selector: 'app-duration-selector',
  imports: [...DEFAULT_IMPORTS],
  templateUrl: './duration-selector.component.html',
  styleUrls: ['./duration-selector.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DurationSelectorComponent {
  public readonly trackNumber = input.required<number>();
  public readonly stepNumber = input.required<number>();
  public step = input<number>(TrackStateService.DEFAULT_DURATION_STEP);
  public numerator = input<number>(
    TrackStateService.DEFAULT_DURATION_NUMERATOR,
  );
  public denominator = input<number>(
    TrackStateService.DEFAULT_DURATION_DENOMINATOR,
  );

  public durationChange = output<number>();

  public denominators = TrackStateService.getDenominators();
  public minStep = TrackStateService.MIN_DURATION_STEP;
  public minDenominator = TrackStateService.MIN_DURATION_DENOMINATOR;
  public minNumerator = TrackStateService.MIN_DURATION_NUMERATOR;
  public uid = crypto.randomUUID().replace(/-/g, '');
  public readonly durationPreview = computed(() => {
    const step = this.step();
    const numerator = this.numerator();
    const denominator = this.denominator();

    // prettier-ignore
    return `${
      step > 0 ? step : ''
    }${
      step > 0 && denominator > this.minDenominator ? ' + ' : ''
    }${
      denominator > this.minDenominator ? numerator + ' / ' + denominator : ''
    }`;
  });

  private readonly _schedulerService: SchedulerService =
    inject(SchedulerService);

  public setStep(step: string): void {
    const stepInt = parseInt(step);

    if (isNaN(stepInt) || stepInt < this.minStep) {
      return;
    }

    this._schedulerService.setDurationStep(
      this.trackNumber(),
      this.stepNumber(),
      stepInt,
    );
  }

  public setNumerator(numerator: string): void {
    const numeratorInt = parseInt(numerator);

    if (
      isNaN(numeratorInt) ||
      numeratorInt < this.minNumerator ||
      numeratorInt >= this.denominator()
    ) {
      return;
    }

    this._schedulerService.setDurationNumerator(
      this.trackNumber(),
      this.stepNumber(),
      numeratorInt,
    );
  }

  public setDenominator(denominator: string): void {
    const denominatorInt = parseInt(denominator);

    if (isNaN(denominatorInt) || !this.denominators.includes(denominatorInt)) {
      return;
    }

    this._schedulerService.setDurationDenominator(
      this.trackNumber(),
      this.stepNumber(),
      denominatorInt,
    );
  }
}
