import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class MersenneGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Mersenne Numbers (2ⁿ − 1)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static mersenne(n: number): number {
    return 2 ** n - 1;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => MersenneGenerator.mersenne(i + 1));

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
    const index = MersenneGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = MersenneGenerator.mersenne(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return MersenneGenerator.limitToMidi(midi);
  }
}
