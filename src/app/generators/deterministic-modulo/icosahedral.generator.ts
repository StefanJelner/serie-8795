import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class IcosahedralGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Icosahedral Numbers (n(5n² - 5n + 2)/2)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static icosahedral(n: number): number {
    return (n * (5 * n * n - 5 * n + 2)) / 2;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => IcosahedralGenerator.icosahedral(i));

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
    const index = IcosahedralGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = IcosahedralGenerator.icosahedral(
      this._startValue + this._index,
    );

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return IcosahedralGenerator.limitToMidi(midi);
  }
}
