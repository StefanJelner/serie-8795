import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class OctagonalGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Octagonal Numbers (3n² - 2n)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static octagonal(n: number): number {
    return 3 * n * n - 2 * n;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => OctagonalGenerator.octagonal(i));

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
    const index = OctagonalGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = OctagonalGenerator.octagonal(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return OctagonalGenerator.limitToMidi(midi);
  }
}
