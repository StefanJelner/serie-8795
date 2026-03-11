import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class EulerianGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Eulerian Numbers A(n,1) (A(n)=n·A(n−1)+1)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = {
    0: 0,
    1: 1,
  };
  private static _cache: Record<number, number> = {
    ...EulerianGenerator._initialCache,
  };

  private static eulerian(n: number): number {
    if (EulerianGenerator._cache[n] !== undefined) {
      return EulerianGenerator._cache[n];
    }

    const value = n * EulerianGenerator.eulerian(n - 1) + 1;

    EulerianGenerator._cache[n] = value;

    return value;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => EulerianGenerator.eulerian(i));

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
    const index = EulerianGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = EulerianGenerator.eulerian(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return EulerianGenerator.limitToMidi(midi);
  }
}
