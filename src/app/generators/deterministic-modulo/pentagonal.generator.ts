import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class PentagonalGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Pentagonal Numbers (n(3n-1)/2)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static pentagonal(n: number): number {
    return (n * (3 * n - 1)) / 2;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => PentagonalGenerator.pentagonal(i));

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
    const index = PentagonalGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = PentagonalGenerator.pentagonal(
      this._startValue + this._index,
    );

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return PentagonalGenerator.limitToMidi(midi);
  }
}
