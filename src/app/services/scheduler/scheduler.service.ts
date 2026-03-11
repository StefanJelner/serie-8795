import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import {
  Bars,
  Rotation,
  Track,
  TrackRuntimeState,
  TransportState,
} from '../../models/scheduler.models';
import { MidiDownloadService } from '../midi-download/midi-download.service';
import { MidiExportService } from '../midi-export/midi-export.service';
import { MidiOutputService } from '../midi-output/midi-output.service';
import { SchedulerEngine } from '../scheduler-engine/scheduler-engine.service';
import { TimingService } from '../timing/timing.service';
import { TrackStateService } from '../track-state/track-state.service';
import { TransportService } from '../transport/transport.service';

export interface UiStatus {
  activeStep: number;
  rotationDeg: number;
}

@Injectable()
export class SchedulerService {
  private readonly _trackState: TrackStateService;
  private readonly _transport: TransportService;
  private readonly _timing: TimingService;
  private readonly _midi: MidiOutputService;
  private readonly _engine$ = new BehaviorSubject<SchedulerEngine | null>(null);
  private readonly _exporter: MidiExportService;
  private readonly _downloader: MidiDownloadService;

  constructor() {
    this._trackState = new TrackStateService();
    this._transport = new TransportService();
    this._timing = new TimingService();
    this._midi = new MidiOutputService();
    this._exporter = new MidiExportService(this._timing);
    this._downloader = new MidiDownloadService();

    void this._midi.init();
  }

  public bpm$(): Observable<number> {
    return this._timing.bpm$();
  }

  public bars$(): Observable<Bars> {
    return this._timing.bars$();
  }

  public tracks$(): Observable<ReadonlyArray<Track>> {
    return this._trackState.tracks$();
  }

  public transportState$(): Observable<TransportState> {
    return this._transport.state$();
  }

  public runtimeState$(): Observable<ReadonlyArray<TrackRuntimeState>> {
    return this._engine$.pipe(
      switchMap((engine) => (engine ? engine.runtimeState$() : of([]))),
    );
  }

  public uiStatus$(): Observable<UiStatus[]> {
    return combineLatest([
      this.tracks$(),
      this.runtimeState$(),
      this.bars$(),
    ]).pipe(
      map(([tracks, runtime, bars]) => {
        return tracks.map((track, index) => {
          const run = runtime[index];

          const activeStep =
            (run.nextStepIndex + track.rotation.shift * bars.base) %
            track.steps;

          const rotationDeg =
            ((track.rotation.shift * bars.base) / track.steps) * 360;

          return {
            activeStep,
            rotationDeg,
          };
        });
      }),
    );
  }

  public setBpm(bpm: number): void {
    this._timing.setBpm(bpm);
  }

  public setBars(bars: Bars): void {
    this._timing.setBars(bars);
  }

  public setTrackActive(id: number, active: boolean): void {
    this._trackState.setTrackActive(id, active);
  }

  public setTrackSteps(id: number, steps: number): void {
    this._trackState.setTrackSteps(id, steps);
  }

  public setRotation(id: number, rotation: Rotation): void {
    this._trackState.setRotation(id, rotation);
  }

  public setMidiChannel(id: number, channel: number): void {
    this._trackState.setMidiChannel(id, channel);
  }

  public setNote(track: number, step: number, note: number | null): void {
    this._trackState.setNote(track, step, note);
  }

  public setVelocity(track: number, step: number, velocity: number): void {
    this._trackState.setVelocity(track, step, velocity);
  }

  public setDuration(track: number, step: number, duration: number): void {
    this._trackState.setDuration(track, step, duration);
  }

  public play(): void {
    this._initEngineIfNeeded();

    this._transport.play();
  }

  public pause(): void {
    this._initEngineIfNeeded();

    this._transport.pause();
  }

  public stop(): void {
    this._initEngineIfNeeded();

    this._transport.stop();

    this._engine$.pipe(take(1)).subscribe((engine) => engine?.resetRuntime());
  }

  public getMidiOutputs() {
    return this._midi.getOutputs();
  }

  public selectMidiOutput(id: string): void {
    this._midi.selectOutput(id);
  }

  public downloadMidiFile(lengthSeconds: number, callback: () => void): void {
    combineLatest([
      this._trackState.tracks$(),
      this._timing.bpm$(),
      this._timing.bars$(),
    ])
      .pipe(take(1))
      .subscribe(([tracks, bpm, bars]) => {
        this._downloader
          .download(
            this._exporter.renderMidiFile(lengthSeconds, tracks, bpm, bars),
          )
          .then(callback);
      });
  }

  private _initEngineIfNeeded(): void {
    this._engine$.pipe(take(1)).subscribe((engine) => {
      if (engine instanceof SchedulerEngine) {
        return;
      }

      this._engine$.next(
        new SchedulerEngine(
          this._timing,
          this._transport,
          this._trackState,
          this._midi,
        ),
      );
    });
  }
}
