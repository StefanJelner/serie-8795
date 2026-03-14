import { BehaviorSubject, Observable } from 'rxjs';

export interface Bars {
  base: number;
  value: number;
}

export class TimingService {
  public static readonly DEFAULT_BPM = 120;
  public static readonly DEFAULT_BASE = 4;
  public static readonly DEFAULT_VALUE = 4;

  public static readonly MIN_BPM = 20;
  public static readonly MIN_BARS = 1;

  public static readonly MAX_BPM = 300;
  public static readonly MAX_BARS = 128;

  private readonly _bpm$ = new BehaviorSubject<number>(
    TimingService.DEFAULT_BPM,
  );

  private readonly _bars$ = new BehaviorSubject<Bars>({
    base: TimingService.DEFAULT_BASE,
    value: TimingService.DEFAULT_VALUE,
  });

  public bpm$(): Observable<number> {
    return this._bpm$.asObservable();
  }

  public bars$(): Observable<Bars> {
    return this._bars$.asObservable();
  }

  public setBpm(bpm: number): void {
    if (bpm < TimingService.MIN_BPM || bpm > TimingService.MAX_BPM) {
      return;
    }

    this._bpm$.next(bpm);
  }

  public setBars(bars: Bars): void {
    if (
      bars.value < TimingService.MIN_BARS ||
      bars.value > TimingService.MAX_BARS
    ) {
      return;
    }

    this._bars$.next(bars);
  }

  public resetBars(): void {
    this._bars$.next({
      base: TimingService.DEFAULT_BASE,
      value: TimingService.DEFAULT_VALUE,
    });
  }

  public getStepDuration(bpm: number, bars: Bars): number {
    const beatsPerSecond = bpm / 60;
    const barBeats = bars.value * bars.base;
    const barDuration = barBeats / beatsPerSecond;

    return barDuration / bars.value;
  }
}
