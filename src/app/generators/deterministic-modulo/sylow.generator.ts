import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class SylowGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Sylow Numbers (S(n)=S(n−1)+S(⌊n/2⌋))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = {
    0: 0,
    1: 1,
  };
  private static _cache: Record<number, number> = {
    ...SylowGenerator._initialCache,
  };

  private static sylow(n: number): number {
    if (SylowGenerator._cache[n] !== undefined) {
      return SylowGenerator._cache[n];
    }

    const value =
      SylowGenerator.sylow(n - 1) + SylowGenerator.sylow(Math.floor(n / 2));

    SylowGenerator._cache[n] = value;

    return value;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => SylowGenerator.sylow(i));

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
    const index = SylowGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = SylowGenerator.sylow(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return SylowGenerator.limitToMidi(midi);
  }
}
