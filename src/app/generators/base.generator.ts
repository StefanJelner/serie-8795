import { ToneSpace } from '../chord-progressions/base.chord-progressions';
import { MidiHelper } from '../helpers/midi.helper';

export enum GeneratorType {
  DETERMINISTIC_MODULO = 'DETERMINISTIC_MODULO',
  RANDOM_CHORD_PROGRESSION = 'RANDOM_CHORD_PROGRESSION',
}

export abstract class BaseGenerator {
  static readonly realName: string =
    'Please provide a real name for this generator';
  static readonly type: GeneratorType | null = null;

  protected static limitToMidi(value: number): number {
    return MidiHelper.limitToMidi(value);
  }

  public getNextValues(count: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < count; i++) {
      result.push(this.nextNote());
    }

    return result;
  }

  protected abstract nextNote(): number;
}

export abstract class BaseDeterministicModuloGenerator extends BaseGenerator {
  static readonly recommendedStartValues:
    | number[]
    | Record<string, number | number[]> = [];

  protected static readonly MAX_INDEX = 500;

  protected abstract _rootMidi: number;
  protected abstract _toneRange: number;
  protected abstract _startValue: number | number[];
  protected abstract _reverse: boolean;
  protected _index: number = 0;

  abstract init(
    rootMidi: number,
    toneRange: number,
    startValue: number | string,
    reverse: boolean,
  ): void;

  reset() {
    this._index = 0;
  }

  protected _advanceIndex() {
    this._index++;

    if (this._index > (this.constructor as any).MAX_INDEX) {
      this.reset();
    }
  }

  protected _getOffset(value: number): number {
    let offset = value % this._toneRange;

    if (this._reverse) {
      offset = this._toneRange - 1 - offset;
    }

    return offset;
  }
}

export abstract class BaseRandomChordProgressionGenerator extends BaseGenerator {
  protected buildToneSpacePool(
    tonespace: ToneSpace,
    toneRange: number,
  ): number[] {
    const key = tonespace.join(',');
    const cached = this._toneSpacePoolCache[key];

    if (cached) {
      return cached;
    }

    const octaves = Math.ceil(toneRange / 12);
    const pool = Array.from({ length: octaves })
      .map((_, octave) => octave)
      .reduce(
        (acc, octave) =>
          acc.concat(tonespace.map((pitchClass) => pitchClass + octave * 12)),
        [] as number[],
      )
      .filter((offset) => offset < toneRange);

    this._toneSpacePoolCache[key] = pool;

    return pool;
  }

  private _toneSpacePoolCache: Record<string, number[]> = Object.create(null);
}
