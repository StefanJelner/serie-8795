import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class DecagonalGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Decagonal Numbers (4n² - 3n)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static decagonal(n: number): number {
    return 4 * n * n - 3 * n;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => DecagonalGenerator.decagonal(i));

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
    const index = DecagonalGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = DecagonalGenerator.decagonal(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return DecagonalGenerator.limitToMidi(midi);
  }
}
