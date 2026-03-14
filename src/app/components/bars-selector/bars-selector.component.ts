import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DEFAULT_IMPORTS } from '../../default-imports';
import { SchedulerService } from '../../services/scheduler/scheduler.service';
import { TimingService } from '../../services/timing/timing.service';

@Component({
  selector: 'app-bars-selector',
  imports: [...DEFAULT_IMPORTS],
  templateUrl: './bars-selector.component.html',
  styleUrls: ['./bars-selector.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BarsSelectorComponent {
  public readonly base = signal<number>(TimingService.DEFAULT_BASE);
  public readonly value = signal<number>(TimingService.DEFAULT_VALUE);
  public readonly minBars = TimingService.MIN_BARS;
  public readonly maxBars = TimingService.MAX_BARS;

  private readonly _schedulerService: SchedulerService =
    inject(SchedulerService);

  constructor() {
    effect(() => {
      const base = this.base();
      const value = this.value();

      if (base === null || value === null) {
        this._schedulerService.resetBars();

        return;
      }

      this._schedulerService.setBars({ base, value });
    });
  }

  public setBase(base: number) {
    if (!Number.isInteger(base) || base <= 0) {
      this.base.set(TimingService.DEFAULT_BASE);

      return;
    }

    this.base.set(base);
  }

  public setValue(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      this.value.set(TimingService.DEFAULT_VALUE);

      return;
    }

    this.value.set(value);
  }
}
