import { BehaviorSubject, Observable, Subject, withLatestFrom } from 'rxjs';
import { MidiHelper } from '../../helpers/midi.helper';
import { TimingService } from '../timing/timing.service';

export interface Rotation {
  after: number;
  shift: number;
}

export interface Duration {
  step: number;
  numerator: number;
  denominator: number;
}

export interface Step {
  octave: number | null;
  semitone: number | null;
  velocity: number;
  duration: Duration;
}

export interface Track {
  active: boolean;
  solo: boolean;
  mute: boolean;
  rotation: Rotation;
  midiChannel: number;
  steps: ReadonlyArray<Step>;
  swing: number;
  humanize: number;
}

export interface TrackRuntimeState {
  nextStepIndex: number;
  nextStepTime: number;
  cycleCount: number;
}

export class TrackStateService {
  public static readonly DEFAULT_TRACKS = 8;
  public static readonly DEFAULT_STEPS = 16;
  public static readonly DEFAULT_OCTAVE: number | null = null;
  public static readonly DEFAULT_SEMITONE: number | null = null;
  public static readonly DEFAULT_VELOCITY = 100;
  public static readonly MIN_VELOCITY = 0;
  public static readonly MAX_VELOCITY = 127;
  public static readonly DEFAULT_DURATION_STEP = 1;
  public static readonly MIN_DURATION_STEP = 0;
  private static readonly OCTAVES = Array.from({ length: 11 }, (_, i) => i - 1); // -1 to 9
  public static readonly MIN_OCTAVE = TrackStateService.OCTAVES[0];
  public static readonly MAX_OCTAVE =
    TrackStateService.OCTAVES[TrackStateService.OCTAVES.length - 1];
  private static readonly SEMITONES = [
    'C',
    'C#/Db',
    'D',
    'D#/Eb',
    'E',
    'F',
    'F#/Gb',
    'G',
    'G#/Ab',
    'A',
    'A#/Bb',
    'B',
  ];
  public static readonly MIN_SEMITONE = 0;
  public static readonly MAX_SEMITONE = TrackStateService.SEMITONES.length - 1;
  public static readonly getOctaves = () => TrackStateService.OCTAVES.slice();
  public static readonly getSemitones = () =>
    TrackStateService.SEMITONES.slice();
  public static readonly getMidiNote = (
    octave: number,
    semitone: number,
  ): number => {
    return MidiHelper.limitToMidi((octave + 1) * 12 + semitone);
  };
  public static readonly maxSemitone = (
    octave: number | null,
    semitone: number | null,
  ): boolean => octave === 9 && semitone !== null && semitone > 7;
  private static readonly DURATION_DENOMINATORS = Array.from(
    { length: Math.log2(TimingService.MAX_BARS) },
    (_, i) => 2 ** (i + 1),
  );
  public static readonly getDenominators = () =>
    TrackStateService.DURATION_DENOMINATORS.slice();
  public static readonly DEFAULT_DURATION_DENOMINATOR = 1;
  public static readonly MIN_DURATION_DENOMINATOR = 1;
  public static readonly MAX_DURATION_DENOMINATOR =
    TrackStateService.DURATION_DENOMINATORS[
      TrackStateService.DURATION_DENOMINATORS.length - 1
    ];
  public static readonly DEFAULT_DURATION_NUMERATOR = 0;
  public static readonly MIN_DURATION_NUMERATOR = 0;
  public static readonly getDurationFloat = (
    step: number,
    numerator: number,
    denominator: number,
  ): number => {
    if (
      denominator <= TrackStateService.MIN_DURATION_DENOMINATOR ||
      denominator > TimingService.MAX_BARS ||
      numerator < TrackStateService.MIN_DURATION_NUMERATOR ||
      numerator >= denominator ||
      step <= TrackStateService.MIN_DURATION_STEP
    ) {
      return 0;
    }

    return step + numerator / denominator;
  };
  public static readonly DEFAULT_SWING = 0;
  public static readonly MIN_SWING = -40;
  public static readonly MAX_SWING = 40;
  public static readonly DEFAULT_HUMANIZE = 0;
  public static readonly MIN_HUMANIZE = 0;
  public static readonly MAX_HUMANIZE = 15;

  private readonly _tracks$ = new BehaviorSubject<ReadonlyArray<Track>>(
    Array.from({
      length: TrackStateService.DEFAULT_TRACKS,
    }).map((_) => ({
      active: false,
      solo: false,
      mute: false,
      rotation: {
        after: 1,
        shift: 0,
      },
      midiChannel: 0,
      steps: Array(TrackStateService.DEFAULT_STEPS).fill({
        octave: TrackStateService.DEFAULT_OCTAVE,
        semitone: TrackStateService.DEFAULT_SEMITONE,
        velocity: TrackStateService.DEFAULT_VELOCITY,
        duration: {
          step: TrackStateService.DEFAULT_DURATION_STEP,
          numerator: TrackStateService.DEFAULT_DURATION_NUMERATOR,
          denominator: TrackStateService.DEFAULT_DURATION_DENOMINATOR,
        },
      }),
      swing: TrackStateService.DEFAULT_SWING,
      humanize: TrackStateService.DEFAULT_HUMANIZE,
    })),
  );

  private readonly _trackUpdates$ = new Subject<
    (tracks: ReadonlyArray<Track>) => ReadonlyArray<Track>
  >();

  constructor() {
    this._trackUpdates$
      .pipe(withLatestFrom(this._tracks$))
      .subscribe(([callback, tracks]) => {
        this._tracks$.next(callback(tracks));
      });
  }

  public tracks$(): Observable<ReadonlyArray<Track>> {
    return this._tracks$.asObservable();
  }

  public setTrackActive(id: number, active: boolean): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, id, (track) => {
        return {
          ...track,
          active,
        };
      });
    });
  }

  public setTrackSolo(id: number, solo: boolean): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, id, (track) => {
        return {
          ...track,
          solo,
        };
      });
    });
  }

  public setTrackMute(id: number, mute: boolean): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, id, (track) => {
        return {
          ...track,
          mute,
        };
      });
    });
  }

  public setTrackSteps(id: number, steps: number): void {
    if (steps <= 0) {
      return;
    }

    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, id, (track) => {
        return {
          ...track,
          steps: this.resizeArray(track.steps, steps, {
            octave: TrackStateService.DEFAULT_OCTAVE,
            semitone: TrackStateService.DEFAULT_SEMITONE,
            velocity: TrackStateService.DEFAULT_VELOCITY,
            duration: {
              step: TrackStateService.DEFAULT_DURATION_STEP,
              numerator: TrackStateService.DEFAULT_DURATION_NUMERATOR,
              denominator: TrackStateService.DEFAULT_DURATION_DENOMINATOR,
            },
          }),
        };
      });
    });
  }

  public setTrackRotation(id: number, rotation: Rotation): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, id, (track) => {
        return {
          ...track,
          rotation,
        };
      });
    });
  }

  public setTrackMidiChannel(id: number, channel: number): void {
    if (channel < 0 || channel > 15) {
      return;
    }

    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, id, (track) => {
        return {
          ...track,
          midiChannel: channel,
        };
      });
    });
  }

  public setStepOctave(
    trackId: number,
    step: number,
    octave: number | null,
  ): void {
    this._trackUpdates$.next((tracks) => {
      const semitone = tracks[trackId].steps[step].semitone;

      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          steps: this.updateStepArray(track.steps, step, {
            ...track.steps[step],
            octave,
            ...(TrackStateService.maxSemitone(octave, semitone) === true
              ? { semitone: 7 }
              : {}),
          }),
        };
      });
    });
  }

  public setStepSemitone(
    trackId: number,
    step: number,
    semitone: number | null,
  ): void {
    this._trackUpdates$.next((tracks) => {
      const octave = tracks[trackId].steps[step].octave;

      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          steps: this.updateStepArray(track.steps, step, {
            ...track.steps[step],
            semitone:
              TrackStateService.maxSemitone(octave, semitone) === true
                ? 7
                : semitone,
          }),
        };
      });
    });
  }

  public setStepVelocity(
    trackId: number,
    step: number,
    velocity: number,
  ): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          steps: this.updateStepArray(track.steps, step, {
            ...track.steps[step],
            velocity: Math.max(
              TrackStateService.MIN_VELOCITY,
              Math.min(velocity, TrackStateService.MAX_VELOCITY),
            ),
          }),
        };
      });
    });
  }

  public setStepDurationStep(
    trackId: number,
    step: number,
    durationStep: number,
  ): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          steps: this.updateStepArray(track.steps, step, {
            ...track.steps[step],
            duration: {
              ...track.steps[step].duration,
              step: Math.max(TrackStateService.MIN_DURATION_STEP, durationStep),
            },
          }),
        };
      });
    });
  }

  public setStepDurationNumerator(
    trackId: number,
    step: number,
    durationNumerator: number,
  ): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          steps: this.updateStepArray(track.steps, step, {
            ...track.steps[step],
            duration: {
              ...track.steps[step].duration,
              numerator: Math.max(
                TrackStateService.MIN_DURATION_NUMERATOR,
                Math.min(
                  durationNumerator,
                  track.steps[step].duration.denominator - 1,
                  TrackStateService.MAX_DURATION_DENOMINATOR - 1,
                ),
              ),
            },
          }),
        };
      });
    });
  }

  public setStepDurationDenominator(
    trackId: number,
    step: number,
    durationDenominator: number,
  ): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          steps: this.updateStepArray(track.steps, step, {
            ...track.steps[step],
            duration: {
              ...track.steps[step].duration,
              numerator: Math.min(
                track.steps[step].duration.numerator,
                durationDenominator - 1,
                TrackStateService.MAX_DURATION_DENOMINATOR - 1,
              ),
              denominator: Math.max(
                TrackStateService.MIN_DURATION_DENOMINATOR,
                Math.min(
                  durationDenominator,
                  TrackStateService.MAX_DURATION_DENOMINATOR,
                ),
              ),
            },
          }),
        };
      });
    });
  }

  public setTrackSwing(trackId: number, swing: number): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          swing: Math.max(
            TrackStateService.MIN_SWING,
            Math.min(swing, TrackStateService.MAX_SWING),
          ),
        };
      });
    });
  }

  public setTrackHumanize(trackId: number, humanize: number): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          humanize: Math.max(
            TrackStateService.MIN_HUMANIZE,
            Math.min(humanize, TrackStateService.MAX_HUMANIZE),
          ),
        };
      });
    });
  }

  private updateTrack(
    tracks: ReadonlyArray<Track>,
    id: number,
    update: (track: Track) => Track,
  ): ReadonlyArray<Track> {
    return tracks.slice(0, id).concat(update(tracks[id]), tracks.slice(id + 1));
  }

  private updateStepArray<T>(
    arr: ReadonlyArray<T>,
    index: number,
    value: T,
  ): ReadonlyArray<T> {
    return arr.slice(0, index).concat(value, arr.slice(index + 1));
  }

  private resizeArray<T>(
    arr: ReadonlyArray<T>,
    size: number,
    fill: T,
  ): ReadonlyArray<T> {
    if (arr.length === size) {
      return arr;
    }

    if (arr.length > size) {
      return arr.slice(0, size);
    }

    return arr.concat(Array(size - arr.length).fill(fill));
  }
}
