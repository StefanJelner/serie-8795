import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class CenteredHexagonalGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Centered Hexagonal Numbers (3n² - 3n + 1)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static centeredHexagonal(n: number): number {
    return 3 * n * n - 3 * n + 1;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => CenteredHexagonalGenerator.centeredHexagonal(i));

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
    const index = CenteredHexagonalGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = CenteredHexagonalGenerator.centeredHexagonal(
      this._startValue + this._index,
    );

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return CenteredHexagonalGenerator.limitToMidi(midi);
  }
}
