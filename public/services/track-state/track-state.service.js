import { BehaviorSubject, Subject, withLatestFrom } from 'rxjs';
import { MidiHelper } from '../../helpers/midi.helper';
export class TrackStateService {
    static DEFAULT_TRACKS = 8;
    static DEFAULT_STEPS = 16;
    static DEFAULT_OCTAVE = null;
    static DEFAULT_SEMITONE = null;
    static DEFAULT_VELOCITY = 100;
    static MIN_VELOCITY = 0;
    static MAX_VELOCITY = 127;
    static DEFAULT_DURATION = 1;
    static OCTAVES = Array.from({ length: 11 }, (_, i) => i - 1); // -1 to 9
    static MIN_OCTAVE = TrackStateService.OCTAVES[0];
    static MAX_OCTAVE = TrackStateService.OCTAVES[TrackStateService.OCTAVES.length - 1];
    static SEMITONES = [
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
    static MIN_SEMITONE = 0;
    static MAX_SEMITONE = TrackStateService.SEMITONES.length - 1;
    static getOctaves = () => TrackStateService.OCTAVES.slice();
    static getSemitones = () => TrackStateService.SEMITONES.slice();
    static getMidiNote = (octave, semitone) => {
        return MidiHelper.limitToMidi((octave + 1) * 12 + semitone);
    };
    static maxSemitone = (octave, semitone) => octave === 9 && semitone !== null && semitone > 7;
    _tracks$ = new BehaviorSubject(Array.from({
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
            duration: TrackStateService.DEFAULT_DURATION,
        }),
    })));
    _trackUpdates$ = new Subject();
    constructor() {
        this._trackUpdates$
            .pipe(withLatestFrom(this._tracks$))
            .subscribe(([callback, tracks]) => {
            this._tracks$.next(callback(tracks));
        });
    }
    tracks$() {
        return this._tracks$.asObservable();
    }
    setTrackActive(id, active) {
        this._trackUpdates$.next((tracks) => {
            return this.updateTrack(tracks, id, (track) => {
                return {
                    ...track,
                    active,
                };
            });
        });
    }
    setTrackSolo(id, solo) {
        this._trackUpdates$.next((tracks) => {
            return this.updateTrack(tracks, id, (track) => {
                return {
                    ...track,
                    solo,
                };
            });
        });
    }
    setTrackMute(id, mute) {
        this._trackUpdates$.next((tracks) => {
            return this.updateTrack(tracks, id, (track) => {
                return {
                    ...track,
                    mute,
                };
            });
        });
    }
    setTrackSteps(id, steps) {
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
                        duration: TrackStateService.DEFAULT_DURATION,
                    }),
                };
            });
        });
    }
    setRotation(id, rotation) {
        this._trackUpdates$.next((tracks) => {
            return this.updateTrack(tracks, id, (track) => {
                return {
                    ...track,
                    rotation,
                };
            });
        });
    }
    setMidiChannel(id, channel) {
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
    setOctave(trackId, step, octave) {
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
    setSemitone(trackId, step, semitone) {
        this._trackUpdates$.next((tracks) => {
            const octave = tracks[trackId].steps[step].octave;
            return this.updateTrack(tracks, trackId, (track) => {
                return {
                    ...track,
                    steps: this.updateStepArray(track.steps, step, {
                        ...track.steps[step],
                        semitone: TrackStateService.maxSemitone(octave, semitone) === true
                            ? 7
                            : semitone,
                    }),
                };
            });
        });
    }
    setVelocity(trackId, step, velocity) {
        this._trackUpdates$.next((tracks) => {
            return this.updateTrack(tracks, trackId, (track) => {
                return {
                    ...track,
                    steps: this.updateStepArray(track.steps, step, {
                        ...track.steps[step],
                        velocity,
                    }),
                };
            });
        });
    }
    setDuration(trackId, step, duration) {
        this._trackUpdates$.next((tracks) => {
            return this.updateTrack(tracks, trackId, (track) => {
                return {
                    ...track,
                    steps: this.updateStepArray(track.steps, step, {
                        ...track.steps[step],
                        duration,
                    }),
                };
            });
        });
    }
    updateTrack(tracks, id, update) {
        return tracks.slice(0, id).concat(update(tracks[id]), tracks.slice(id + 1));
    }
    updateStepArray(arr, index, value) {
        return arr.slice(0, index).concat(value, arr.slice(index + 1));
    }
    resizeArray(arr, size, fill) {
        if (arr.length === size) {
            return arr;
        }
        if (arr.length > size) {
            return arr.slice(0, size);
        }
        return arr.concat(Array(size - arr.length).fill(fill));
    }
}
