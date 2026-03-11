import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class JacobsthalGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Jacobsthal Numbers (Jₙ = Jₙ₋₁ + 2Jₙ₋₂)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = { 0: 0, 1: 1 };
  private static _cache: Record<number, number> = {
    ...JacobsthalGenerator._initialCache,
  };

  private static jacobsthal(n: number): number {
    if (JacobsthalGenerator._cache[n] !== undefined) {
      return JacobsthalGenerator._cache[n];
    }

    const value =
      JacobsthalGenerator.jacobsthal(n - 1) +
      2 * JacobsthalGenerator.jacobsthal(n - 2);

    JacobsthalGenerator._cache[n] = value;
    return value;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => JacobsthalGenerator.jacobsthal(i));

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
    const index = JacobsthalGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = JacobsthalGenerator.jacobsthal(
      this._startValue + this._index,
    );

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return JacobsthalGenerator.limitToMidi(midi);
  }
}
