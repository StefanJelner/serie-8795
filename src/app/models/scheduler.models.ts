export enum TransportState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export interface Bars {
  base: number;
  value: number;
}

export interface Rotation {
  after: number;
  shift: number;
}

export interface Track {
  active: boolean;
  solo: boolean;
  mute: boolean;
  steps: number;
  rotation: Rotation;
  midiChannel: number;
  notes: ReadonlyArray<number | null>;
  velocity: ReadonlyArray<number>;
  duration: ReadonlyArray<number>;
}

export interface TrackRuntimeState {
  nextStepIndex: number;
  nextStepTime: number;
  cycleCount: number;
}

export interface MidiEvent {
  time: number;
  type: 'on' | 'off';
  channel: number;
  note: number;
  velocity: number;
}
