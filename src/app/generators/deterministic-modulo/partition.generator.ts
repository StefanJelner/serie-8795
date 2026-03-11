import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class PartitionGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName =
    'Partition Numbers (p(n) via Euler pentagonal recursion)';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static _initialCache: Record<number, number> = { 0: 1 };
  private static _cache: Record<number, number> = {
    ...PartitionGenerator._initialCache,
  };

  private static partition(n: number): number {
    if (n < 0) {
      return 0;
    }

    if (PartitionGenerator._cache[n] !== undefined) {
      return PartitionGenerator._cache[n];
    }

    let total = 0;
    let k = 1;

    while (true) {
      const pent1 = (k * (3 * k - 1)) / 2;
      const pent2 = (k * (3 * k + 1)) / 2;

      if (pent1 > n && pent2 > n) {
        break;
      }

      const sign = k % 2 === 0 ? -1 : 1;

      if (pent1 <= n) {
        total += sign * PartitionGenerator.partition(n - pent1);
      }

      if (pent2 <= n) {
        total += sign * PartitionGenerator.partition(n - pent2);
      }

      k++;
    }

    PartitionGenerator._cache[n] = total;

    return total;
  }

  static override readonly recommendedStartValues = Array.from({
    length: 100,
  }).map((_, i) => PartitionGenerator.partition(i));

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
    const index = PartitionGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = PartitionGenerator.partition(this._startValue + this._index);

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return PartitionGenerator.limitToMidi(midi);
  }
}
