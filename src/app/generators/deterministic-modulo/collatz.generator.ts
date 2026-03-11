import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class CollatzGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Collatz Sequence (n→n/2, 3n+1)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;
  static override readonly recommendedStartValues = [
    27, 31, 41, 47, 54, 75, 97, 129, 171, 231, 313, 327, 703,
  ];

  private static collatz(n: number): number {
    return n % 2 === 0 ? n / 2 : 3 * n + 1;
  }

  protected override _rootMidi!: number;
  protected override _toneRange!: number;
  protected override _startValue!: number;
  protected override _reverse!: boolean;
  private _current!: number;

  init(
    rootMidi: number,
    toneRange: number,
    startValue: number | string = 27,
    reverse: boolean = false,
  ) {
    const index = CollatzGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
    this._current = CollatzGenerator.recommendedStartValues[this._startValue];
  }

  protected nextNote(): number {
    const value = this._current;

    this._current = CollatzGenerator.collatz(this._current);

    if (this._current === 1) {
      this._current = CollatzGenerator.recommendedStartValues[this._startValue];
    }

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return CollatzGenerator.limitToMidi(midi);
  }

  override reset(): void {
    super.reset();

    this._current = CollatzGenerator.recommendedStartValues[this._startValue];
  }
}
