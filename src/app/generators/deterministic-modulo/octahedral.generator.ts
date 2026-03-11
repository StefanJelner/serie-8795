import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class OctahedralGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Octahedral Numbers (n(2n² + 1)/3)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static octahedral(n: number): number {
    return (n * (2 * n * n + 1)) / 3;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => OctahedralGenerator.octahedral(i));

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
    const index = OctahedralGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = OctahedralGenerator.octahedral(
      this._startValue + this._index,
    );

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return OctahedralGenerator.limitToMidi(midi);
  }
}
