import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class HofstadterGGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Hofstadter G Sequence (G(n)=n−G(G(n−1)))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = { 0: 0 };
  private static _cache: Record<number, number> = {
    ...HofstadterGGenerator._initialCache,
  };

  private static g(n: number): number {
    if (n <= 0) {
      return 0;
    }

    if (HofstadterGGenerator._cache[n] !== undefined) {
      return HofstadterGGenerator._cache[n];
    }

    const prev = HofstadterGGenerator.g(n - 1);
    const value = n - HofstadterGGenerator.g(prev);

    HofstadterGGenerator._cache[n] = value;

    return value;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => HofstadterGGenerator.g(i));

  protected override _rootMidi!: number;
  protected override _toneRange!: number;
  protected override _startValue!: number;
  protected override _reverse!: boolean;

  init(
    rootMidi: number,
    toneRange: number,
    startValue: number | string = 0,
    reverse: boolean = false,
  ) {
    const index = HofstadterGGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = HofstadterGGenerator.g(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return HofstadterGGenerator.limitToMidi(midi);
  }
}
