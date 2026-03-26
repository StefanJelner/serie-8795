import { BehaviorSubject } from 'rxjs';
export class TimingService {
    static DEFAULT_BPM = 120;
    static DEFAULT_BASE = 4;
    static DEFAULT_VALUE = 4;
    static MIN_BPM = 20;
    static MIN_BARS = 1;
    static MAX_BPM = 300;
    static MAX_BARS = 128;
    _bpm$ = new BehaviorSubject(TimingService.DEFAULT_BPM);
    _bars$ = new BehaviorSubject({
        base: TimingService.DEFAULT_BASE,
        value: TimingService.DEFAULT_VALUE,
    });
    bpm$() {
        return this._bpm$.asObservable();
    }
    bars$() {
        return this._bars$.asObservable();
    }
    setBpm(bpm) {
        if (bpm < TimingService.MIN_BPM || bpm > TimingService.MAX_BPM) {
            return;
        }
        this._bpm$.next(bpm);
    }
    setBars(bars) {
        if (bars.value < TimingService.MIN_BARS ||
            bars.value > TimingService.MAX_BARS) {
            return;
        }
        this._bars$.next(bars);
    }
    resetBars() {
        this._bars$.next({
            base: TimingService.DEFAULT_BASE,
            value: TimingService.DEFAULT_VALUE,
        });
    }
    getStepDuration(bpm, bars) {
        const beatsPerSecond = bpm / 60;
        const barBeats = bars.value * bars.base;
        const barDuration = barBeats / beatsPerSecond;
        return barDuration / bars.value;
    }
}
