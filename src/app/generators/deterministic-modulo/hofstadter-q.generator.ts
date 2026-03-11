import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class HofstadterQGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Hofstadter Q Sequence (Q(n) = Q(n-Q(n-1)) + Q(n-Q(n-2)))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = {
    1: 1,
    2: 1,
  };
  private static _cache: Record<number, number> = {
    ...HofstadterQGenerator._initialCache,
  };

  private static q(n: number): number {
    if (n <= 0) {
      return 0;
    }

    if (HofstadterQGenerator._cache[n] !== undefined) {
      return HofstadterQGenerator._cache[n];
    }

    const q1 = HofstadterQGenerator.q(n - HofstadterQGenerator.q(n - 1));
    const q2 = HofstadterQGenerator.q(n - HofstadterQGenerator.q(n - 2));

    const value = q1 + q2;
    HofstadterQGenerator._cache[n] = value;

    return value;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => HofstadterQGenerator.q(i + 1));

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
    const index = HofstadterQGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const n = this._startValue + this._index + 1; // Q starts at 1
    const value = HofstadterQGenerator.q(n);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return HofstadterQGenerator.limitToMidi(midi);
  }
}
