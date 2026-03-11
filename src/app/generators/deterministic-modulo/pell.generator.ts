import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class PellGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Pell Numbers (Pₙ = 2Pₙ₋₁ + Pₙ₋₂)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static pell(n: number): number {
    if (n === 0) {
      return 0;
    }

    if (n === 1) {
      return 1;
    }

    let a = 0; // P0
    let b = 1; // P1

    for (let i = 2; i <= n; i++) {
      const next = 2 * b + a;

      a = b;
      b = next;
    }

    return b;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => PellGenerator.pell(i));

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
    const index = PellGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = PellGenerator.pell(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return PellGenerator.limitToMidi(midi);
  }
}
