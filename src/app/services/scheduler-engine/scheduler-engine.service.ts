import { BehaviorSubject, interval, Observable, Subject } from 'rxjs';
import { filter, withLatestFrom } from 'rxjs/operators';
import { SchedulerWorkletNode } from '../../worklets/scheduler/scheduler.worklet';
import { MidiOutputService } from '../midi-output/midi-output.service';
import { Bars, TimingService } from '../timing/timing.service';
import {
  Track,
  TrackRuntimeState,
  TrackStateService,
} from '../track-state/track-state.service';
import {
  TransportService,
  TransportState,
} from '../transport/transport.service';

export class SchedulerEngine {
  public static readonly LOOKAHEAD = 1000;
  public static readonly SCHEDULER_INTERVAL = 25;

  private readonly _runtimeState$ = new BehaviorSubject<
    ReadonlyArray<TrackRuntimeState>
  >([]);
  private readonly _changeRuntimeState$ = new Subject<
    (
      runtimeState: ReadonlyArray<TrackRuntimeState>,
    ) => ReadonlyArray<TrackRuntimeState>
  >();
  private readonly _audioCtx = new AudioContext();
  private _audioWorklet: SchedulerWorkletNode | undefined = undefined;

  constructor(
    private readonly timing: TimingService,
    private readonly transport: TransportService,
    private readonly tracks: TrackStateService,
    private readonly midi: MidiOutputService,
  ) {
    this._audioCtx.audioWorklet
      .addModule('/worklets/scheduler/scheduler.worklet.js')
      .then(() => {
        this._audioWorklet = new AudioWorkletNode(
          this._audioCtx,
          'scheduler-worklet',
        ) as SchedulerWorkletNode;

        this._audioWorklet.port.onmessage = (event) => {
          if (event.data.type === 'position') {
            this._changeRuntimeState$.next(() => event.data.runtime);
          }
        };

        this._audioWorklet.port.postMessage({
          type: 'init',
          trackCount: TrackStateService.DEFAULT_TRACKS,
        });

        this._changeRuntimeState$
          .pipe(withLatestFrom(this._runtimeState$))
          .subscribe(([callback, runtimeState]) => {
            this._runtimeState$.next(callback(runtimeState));
          });

        this._changeRuntimeState$.next(() =>
          Array.from({
            length: TrackStateService.DEFAULT_TRACKS,
          }).map(() => {
            return {
              nextStepIndex: 0,
              nextStepTime: 0,
              cycleCount: 0,
            };
          }),
        );

        interval(SchedulerEngine.SCHEDULER_INTERVAL)
          .pipe(
            withLatestFrom(
              this.transport.state$(),
              this.tracks.tracks$(),
              this.timing.bpm$(),
              this.timing.bars$(),
            ),
            filter(([_, state]) => {
              return state === TransportState.PLAYING;
            }),
          )
          .subscribe(([_, _state, tracks, bpm, bars]) => {
            this.scheduleTick(tracks, bpm, bars);
          });
      });
  }

  public runtimeState$(): Observable<ReadonlyArray<TrackRuntimeState>> {
    return this._runtimeState$.asObservable();
  }

  public resetRuntime(): void {
    this._changeRuntimeState$.next((runtimeState) =>
      runtimeState.map(() => {
        return {
          nextStepIndex: 0,
          nextStepTime: 0,
          cycleCount: 0,
        };
      }),
    );
  }

  private scheduleTick(
    tracks: ReadonlyArray<Track>,
    bpm: number,
    bars: Bars,
  ): void {
    const now = this._audioCtx.currentTime;
    const lookaheadEnd = now + SchedulerEngine.LOOKAHEAD;

    const stepDuration = this.timing.getStepDuration(bpm, bars);

    tracks.forEach((track, index) => {
      if (!track.active) {
        return;
      }

      let nextTime = now;
      let nextIndex = 0;

      while (nextTime < lookaheadEnd) {
        const octave = track.steps[nextIndex].octave;
        const semitone = track.steps[nextIndex].semitone;

        if (octave === null || semitone === null) {
          continue;
        }

        this._audioWorklet?.port.postMessage({
          type: 'schedule',
          track: index,
          stepIndex: nextIndex,
          time: nextTime,
          cycleCount: 0,
        });

        nextTime += stepDuration;
        nextIndex = (nextIndex + 1) % track.steps.length;
      }
    });
  }
}
