import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class CalkinWilfCantorGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Calkin–Wilf (Cantor-paired integer from p/q)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static calkinWilfPQ(n: number): { p: number; q: number } {
    // Start at 1/1
    let p = 1;
    let q = 1;

    for (let i = 1; i < n; i++) {
      const k = Math.floor(p / q);
      const nextP = q;
      const nextQ = (2 * k + 1) * q - p;

      p = nextP;
      q = nextQ;
    }

    return { p, q };
  }

  // Cantor pairing for positive integers (p,q >= 1) -> integer >= 0
  private static cantorPair(p: number, q: number): number {
    // Convert to naturals starting at 0 if you want: (p-1, q-1)
    const a = p - 1;
    const b = q - 1;
    const s = a + b;

    return (s * (s + 1)) / 2 + b;
  }

  private static calkinWilfCantor(n: number): number {
    const { p, q } = CalkinWilfCantorGenerator.calkinWilfPQ(n);

    return CalkinWilfCantorGenerator.cantorPair(p, q);
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => CalkinWilfCantorGenerator.calkinWilfCantor(i + 1));

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
    const index = CalkinWilfCantorGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = CalkinWilfCantorGenerator.calkinWilfCantor(
      this._startValue + this._index + 1,
    );

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return CalkinWilfCantorGenerator.limitToMidi(midi);
  }
}
