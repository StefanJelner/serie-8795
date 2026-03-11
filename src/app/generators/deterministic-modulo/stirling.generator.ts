import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class StirlingGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Stirling Numbers S(n,2) = 2^(n-1) - 1';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static stirling(n: number): number {
    if (n <= 1) {
      return 0;
    }

    return Math.pow(2, n - 1) - 1;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => StirlingGenerator.stirling(i));

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
    const index = StirlingGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = StirlingGenerator.stirling(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return StirlingGenerator.limitToMidi(midi);
  }
}
