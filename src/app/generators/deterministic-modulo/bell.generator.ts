import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class BellGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Bell Numbers (B(n+1)=Σₖ C(n,k)·B(k))';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = { 0: 1 };
  private static _cache: Record<number, number> = {
    ...BellGenerator._initialCache,
  };

  private static bell(n: number): number {
    if (BellGenerator._cache[n] !== undefined) {
      return BellGenerator._cache[n];
    }

    // Bell triangle
    const bellTriangle: number[][] = [[1]];

    for (let i = 1; i <= n; i++) {
      bellTriangle[i] = [];
      bellTriangle[i][0] = bellTriangle[i - 1][i - 1];

      for (let j = 1; j <= i; j++) {
        bellTriangle[i][j] =
          bellTriangle[i][j - 1] + bellTriangle[i - 1][j - 1];
      }
    }

    const value = bellTriangle[n][0];

    BellGenerator._cache[n] = value;

    return value;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => BellGenerator.bell(i));

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
    const index = BellGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = BellGenerator.bell(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return BellGenerator.limitToMidi(midi);
  }
}
