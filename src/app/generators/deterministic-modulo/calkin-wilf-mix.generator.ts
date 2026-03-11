import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class CalkinWilfMixGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Calkin–Wilf (mixed integer from p/q)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static calkinWilfPQ(n: number): { p: number; q: number } {
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

  // Deterministic 32-bit mixer: returns 0..2^32-1
  private static mixPQ(p: number, q: number): number {
    // start with a linear combination
    let x = (Math.imul(p, 73) + Math.imul(q, 151)) | 0;

    // avalanche mixing (32-bit)
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;

    return x >>> 0;
  }

  private static calkinWilfMix(n: number): number {
    const { p, q } = CalkinWilfMixGenerator.calkinWilfPQ(n);

    return CalkinWilfMixGenerator.mixPQ(p, q);
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => CalkinWilfMixGenerator.calkinWilfMix(i + 1));

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
    const index = CalkinWilfMixGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = CalkinWilfMixGenerator.calkinWilfMix(
      this._startValue + this._index + 1,
    );

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);
    return CalkinWilfMixGenerator.limitToMidi(midi);
  }
}
