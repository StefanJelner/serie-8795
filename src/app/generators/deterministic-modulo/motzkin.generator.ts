import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class MotzkinGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Motzkin Numbers (M(n)=M(n−1)+Σₖ M(k)·M(n−2−k))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = {
    0: 1,
    1: 1,
  };
  private static _cache: Record<number, number> = {
    ...MotzkinGenerator._initialCache,
  };

  private static motzkin(n: number): number {
    if (MotzkinGenerator._cache[n] !== undefined) {
      return MotzkinGenerator._cache[n];
    }

    let total = MotzkinGenerator.motzkin(n - 1);

    for (let k = 0; k <= n - 2; k++) {
      total +=
        MotzkinGenerator.motzkin(k) * MotzkinGenerator.motzkin(n - 2 - k);
    }

    MotzkinGenerator._cache[n] = total;

    return total;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => MotzkinGenerator.motzkin(i));

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
    const index = MotzkinGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = MotzkinGenerator.motzkin(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return MotzkinGenerator.limitToMidi(midi);
  }
}
