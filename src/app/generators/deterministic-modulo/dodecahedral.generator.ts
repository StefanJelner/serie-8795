import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class DodecahedralGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Dodecahedral Numbers (n(3n² - 1))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static dodecahedral(n: number): number {
    return n * (3 * n * n - 1);
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => DodecahedralGenerator.dodecahedral(i));

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
    const index = DodecahedralGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = DodecahedralGenerator.dodecahedral(
      this._startValue + this._index,
    );

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return DodecahedralGenerator.limitToMidi(midi);
  }
}
