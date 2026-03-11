import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class AliquotGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Aliquot Sequence (a(n) = σ(n) − n)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;
  static override readonly recommendedStartValues = [
    6, 12, 18, 20, 24, 28, 30, 36, 40, 48, 60, 66, 70, 72, 84, 90, 96, 100, 108,
    120, 126, 132, 140, 150, 156, 168, 180, 196, 198, 200, 210, 216, 220, 224,
    234, 240, 252, 260, 270, 276, 280, 288, 300, 304, 308, 312, 320, 324, 330,
    336, 340, 348, 350, 360, 364, 372, 378, 384, 396, 400, 408, 420, 432, 440,
    448, 450, 456, 460, 468, 476, 480, 486, 490, 496, 500, 504, 510, 516, 520,
    528, 540, 544, 546, 552, 558, 560, 564, 570, 576, 588, 592, 594, 600, 606,
    612, 616, 620, 624, 630, 636,
  ];

  private static aliquot(n: number): number {
    if (n <= 1) {
      return 0;
    }

    let sum = 1;
    const limit = Math.sqrt(n);

    for (let i = 2; i <= limit; i++) {
      if (n % i === 0) {
        sum += i;
        const other = n / i;

        if (other !== i) {
          sum += other;
        }
      }
    }

    return sum;
  }

  protected override _rootMidi!: number;
  protected override _toneRange!: number;
  protected override _startValue!: number;
  protected override _reverse!: boolean;

  private _current!: number;

  init(
    rootMidi: number,
    toneRange: number,
    startValue: number | string = 12,
    reverse: boolean = false,
  ) {
    const index = AliquotGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
    this._current = AliquotGenerator.recommendedStartValues[this._startValue];
  }

  protected nextNote(): number {
    const value = this._current;

    this._current = AliquotGenerator.aliquot(this._current);

    if (this._current <= 1) {
      this._current = AliquotGenerator.recommendedStartValues[this._startValue];
    }

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return AliquotGenerator.limitToMidi(midi);
  }

  override reset(): void {
    super.reset();

    this._current = AliquotGenerator.recommendedStartValues[this._startValue];
  }
}
