import { BehaviorSubject, Observable, Subject, withLatestFrom } from 'rxjs';
import { Rotation, Track } from '../../models/scheduler.models';

export class TrackStateService {
  public static readonly DEFAULT_TRACKS = 8;
  public static readonly DEFAULT_STEPS = 16;
  public static readonly DEFAULT_VELOCITY = 100;
  public static readonly DEFAULT_DURATION = 1;

  private readonly _tracks$ = new BehaviorSubject<ReadonlyArray<Track>>(
    Array.from({
      length: TrackStateService.DEFAULT_TRACKS,
    }).map((_) => {
      const steps = TrackStateService.DEFAULT_STEPS;

      return {
        active: false,
        solo: false,
        mute: false,
        steps,
        rotation: {
          after: 1,
          shift: 0,
        },
        midiChannel: 0,
        notes: Array(steps).fill(null),
        velocity: Array(steps).fill(TrackStateService.DEFAULT_VELOCITY),
        duration: Array(steps).fill(TrackStateService.DEFAULT_DURATION),
      };
    }),
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
          steps,
          notes: this.resizeArray(track.notes, steps, null),
          velocity: this.resizeArray(track.velocity, steps, 100),
          duration: this.resizeArray(track.duration, steps, 1),
        };
      });
    });
  }

  public setRotation(id: number, rotation: Rotation): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, id, (track) => {
        return {
          ...track,
          rotation,
        };
      });
    });
  }

  public setMidiChannel(id: number, channel: number): void {
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

  public setNote(trackId: number, step: number, note: number | null): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          notes: this.updateStepArray(track.notes, step, note),
        };
      });
    });
  }

  public setVelocity(trackId: number, step: number, velocity: number): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          velocity: this.updateStepArray(track.velocity, step, velocity),
        };
      });
    });
  }

  public setDuration(trackId: number, step: number, duration: number): void {
    this._trackUpdates$.next((tracks) => {
      return this.updateTrack(tracks, trackId, (track) => {
        return {
          ...track,
          duration: this.updateStepArray(track.duration, step, duration),
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
