import {
  Bars,
  MidiEvent,
  Rotation,
  Track,
} from '../../models/scheduler.models';
import { TimingService } from '../timing/timing.service';

export class MidiExportService {
  private static readonly TPQ = 480;

  constructor(private readonly timing: TimingService) {}

  public renderMidiFile(
    lengthSeconds: number,
    tracks: ReadonlyArray<Track>,
    bpm: number,
    bars: Bars,
  ): Uint8Array {
    const eventsPerTrack = this.simulateTracks(
      lengthSeconds,
      tracks,
      bpm,
      bars,
    );

    const trackChunks = eventsPerTrack.map((events) => {
      return this.buildTrackChunk(events, bpm);
    });

    const header = this.buildHeaderChunk(trackChunks.length);

    const bytes = header.concat(...trackChunks);

    return new Uint8Array(bytes);
  }

  private simulateTracks(
    lengthSeconds: number,
    tracks: ReadonlyArray<Track>,
    bpm: number,
    bars: Bars,
  ): ReadonlyArray<ReadonlyArray<MidiEvent>> {
    const stepDuration = this.timing.getStepDuration(bpm, bars);

    const runtime = tracks.map(() => {
      return {
        nextStepIndex: 0,
        cycleCount: 0,
      };
    });

    const events: MidiEvent[][] = tracks.map(() => {
      return [];
    });

    let time = 0;

    while (time < lengthSeconds) {
      tracks.forEach((track, i) => {
        if (!track.active) {
          return;
        }

        const rt = runtime[i];
        const step = rt.nextStepIndex;

        const note = track.notes[step];

        if (note !== null) {
          const velocity = track.velocity[step];
          const duration = track.duration[step];

          events[i].push({
            time,
            type: 'on',
            channel: track.midiChannel,
            note,
            velocity,
          });

          events[i].push({
            time: time + duration,
            type: 'off',
            channel: track.midiChannel,
            note,
            velocity: 0,
          });
        }

        rt.nextStepIndex = (step + 1) % track.steps;

        if (rt.nextStepIndex === 0) {
          rt.cycleCount = rt.cycleCount + 1;

          if (rt.cycleCount % track.rotation.after === 0) {
            rt.nextStepIndex = this.applyRotation(
              rt.nextStepIndex,
              track.rotation,
              bars,
            );
          }
        }
      });

      time = time + stepDuration;
    }

    return events;
  }

  private applyRotation(index: number, rotation: Rotation, bars: Bars): number {
    const shift = rotation.shift * bars.base;

    return (index + shift + 9999) % 9999;
  }

  private buildHeaderChunk(tracks: number): number[] {
    const bytes: number[] = [];

    bytes.push(0x4d, 0x54, 0x68, 0x64);

    bytes.push(0x00, 0x00, 0x00, 0x06);

    bytes.push(0x00, 0x01);

    bytes.push((tracks >> 8) & 0xff, tracks & 0xff);

    const tpq = MidiExportService.TPQ;

    bytes.push((tpq >> 8) & 0xff, tpq & 0xff);

    return bytes;
  }

  private buildTrackChunk(
    events: ReadonlyArray<MidiEvent>,
    bpm: number,
  ): number[] {
    const bytes: number[] = [];

    bytes.push(0x4d, 0x54, 0x72, 0x6b);

    const body: number[] = [];

    const tempo = Math.round(60000000 / bpm);

    body.push(
      0x00,
      0xff,
      0x51,
      0x03,
      (tempo >> 16) & 0xff,
      (tempo >> 8) & 0xff,
      tempo & 0xff,
    );

    const sorted = events.slice().sort((a, b) => {
      return a.time - b.time;
    });

    let lastTick = 0;

    sorted.forEach((ev) => {
      const tick = Math.round(ev.time * (MidiExportService.TPQ * (bpm / 60)));

      const delta = tick - lastTick;

      lastTick = tick;

      body.push(...this.writeVarLen(delta));

      if (ev.type === 'on') {
        body.push(0x90 + ev.channel, ev.note, ev.velocity);
      } else {
        body.push(0x80 + ev.channel, ev.note, 0);
      }
    });

    body.push(0x00, 0xff, 0x2f, 0x00);

    const length = body.length;

    bytes.push(
      (length >> 24) & 0xff,
      (length >> 16) & 0xff,
      (length >> 8) & 0xff,
      length & 0xff,
    );

    return bytes.concat(body);
  }

  private writeVarLen(value: number): number[] {
    let buffer = value & 0x7f;
    const bytes: number[] = [];

    while ((value >>= 7)) {
      buffer <<= 8;
      buffer |= (value & 0x7f) | 0x80;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      bytes.push(buffer & 0xff);

      if (buffer & 0x80) {
        buffer >>= 8;
      } else {
        break;
      }
    }

    return bytes;
  }
}
