import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class HexagonalGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Hexagonal Numbers (2n² - n)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static hexagonal(n: number): number {
    return 2 * n * n - n;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => HexagonalGenerator.hexagonal(i));

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
    const index = HexagonalGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = HexagonalGenerator.hexagonal(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return HexagonalGenerator.limitToMidi(midi);
  }
}
