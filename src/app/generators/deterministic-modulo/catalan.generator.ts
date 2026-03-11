import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class CatalanGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Catalan Numbers (Cₙ = (1/(n+1))·C(2n,n))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static catalan(n: number): number {
    if (n === 0) {
      return 1;
    }

    let c = 1;

    for (let i = 0; i < n; i++) {
      c = (2 * (2 * i + 1) * c) / (i + 2);
    }

    return c;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => CatalanGenerator.catalan(i));

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
    const index = CatalanGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = CatalanGenerator.catalan(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return CatalanGenerator.limitToMidi(midi);
  }
}
