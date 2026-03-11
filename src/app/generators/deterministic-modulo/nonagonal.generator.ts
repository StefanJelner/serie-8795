import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class NonagonalGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Nonagonal Numbers ((7n² - 5n)/2)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static nonagonal(n: number): number {
    return (7 * n * n - 5 * n) / 2;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => NonagonalGenerator.nonagonal(i));

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
    const index = NonagonalGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = NonagonalGenerator.nonagonal(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return NonagonalGenerator.limitToMidi(midi);
  }
}
