import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class SchroederGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Large Schröder Numbers (S(n)=S(n−1)+Σₖ S(k)·S(n−1−k))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = { 0: 1 };
  private static _cache: Record<number, number> = {
    ...SchroederGenerator._initialCache,
  };

  private static schroeder(n: number): number {
    if (SchroederGenerator._cache[n] !== undefined) {
      return SchroederGenerator._cache[n];
    }

    let total = SchroederGenerator.schroeder(n - 1);

    for (let k = 0; k <= n - 1; k++) {
      total +=
        SchroederGenerator.schroeder(k) *
        SchroederGenerator.schroeder(n - 1 - k);
    }

    SchroederGenerator._cache[n] = total;

    return total;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => SchroederGenerator.schroeder(i));

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
    const index = SchroederGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = SchroederGenerator.schroeder(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return SchroederGenerator.limitToMidi(midi);
  }
}
