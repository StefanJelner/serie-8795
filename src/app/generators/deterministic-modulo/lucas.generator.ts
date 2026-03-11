import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class LucasGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Lucas Numbers (Lₙ = Lₙ₋₁ + Lₙ₋₂)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static lucas(n: number): number {
    if (n === 0) {
      return 2;
    }

    if (n === 1) {
      return 1;
    }

    let a = 2;
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
  }).map((_, i) => LucasGenerator.lucas(i));

  protected override _rootMidi!: number;
  protected override _toneRange!: number;
  protected override _startValue!: number;
  protected override _reverse!: boolean;

  init(
    rootMidi: number,
    toneRange: number,
    startValue: number | string = 2,
    reverse: boolean = false,
  ) {
    const index = LucasGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = LucasGenerator.lucas(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return LucasGenerator.limitToMidi(midi);
  }
}
