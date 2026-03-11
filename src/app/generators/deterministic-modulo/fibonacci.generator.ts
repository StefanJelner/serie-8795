import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class FibonacciGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Fibonacci Numbers (Fₙ = Fₙ₋₁ + Fₙ₋₂)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static fibonacci(n: number): number {
    if (n <= 1) {
      return n;
    }

    let a = 0;
    let b = 1;

    for (let i = 2; i <= n; i++) {
      const next = a + b;
      a = b;
      b = next;
    }

    return b;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => FibonacciGenerator.fibonacci(i));

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
    const index = FibonacciGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = FibonacciGenerator.fibonacci(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return FibonacciGenerator.limitToMidi(midi);
  }
}
