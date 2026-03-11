import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  output,
  signal,
} from '@angular/core';
import { Bars } from '../../models/scheduler.models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TimingService } from '../../services/timing/timing.service';

@Component({
  selector: 'app-bars-selector',
  imports: [TranslatePipe],
  templateUrl: './bars-selector.component.html',
  styleUrl: './bars-selector.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BarsSelectorComponent {
  public base = signal<number>(TimingService.DEFAULT_BASE);
  public value = signal<number>(TimingService.DEFAULT_VALUE);

  public readonly barsChange = output<Bars | null>();
  public readonly TimingService = TimingService;

  constructor() {
    effect(() => {
      const base = this.base();
      const value = this.value();

      if (base === null || value === null) {
        this.barsChange.emit(null);

        return;
      }

      this.barsChange.emit({ base, value });
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
