import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class NarayanaGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Narayana Numbers (N(n)=N(n-1)+N(n-3))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = {
    0: 1,
    1: 1,
    2: 1,
  };
  private static _cache: Record<number, number> = {
    ...NarayanaGenerator._initialCache,
  };

  private static narayana(n: number): number {
    if (NarayanaGenerator._cache[n] !== undefined) {
      return NarayanaGenerator._cache[n];
    }

    const value =
      NarayanaGenerator.narayana(n - 1) + NarayanaGenerator.narayana(n - 3);

    NarayanaGenerator._cache[n] = value;

    return value;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => NarayanaGenerator.narayana(i));

  protected override _rootMidi!: number;
  protected override _toneRange!: number;
  protected override _startValue!: number;
  protected override _reverse!: boolean;

  init(
    rootMidi: number,
    toneRange: number,
    startValue: number | string = 1,
    reverse: boolean = false,
  ) {
    const index = NarayanaGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = NarayanaGenerator.narayana(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return NarayanaGenerator.limitToMidi(midi);
  }
}
