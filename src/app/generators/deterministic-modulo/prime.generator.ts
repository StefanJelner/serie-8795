import {
  BaseDeterministicModuloGenerator,
  GeneratorType,
} from '../base.generator';

export class PrimeGenerator extends BaseDeterministicModuloGenerator {
  static override readonly realName = 'Prime Numbers (p with divisors {1,p})';
  static override readonly type = GeneratorType.DETERMINISTIC_MODULO;

  private static readonly primes: number[] = PrimeGenerator.generatePrimes(
    PrimeGenerator.MAX_INDEX,
  );

  private static generatePrimes(count: number): number[] {
    const primes: number[] = [];
    let n = 2;

    while (primes.length < count) {
      if (PrimeGenerator.isPrime(n)) {
        primes.push(n);
      }

      n++;
    }

    return primes;
  }

  private static isPrime(n: number): boolean {
    if (n < 2) {
      return false;
    }

    for (let i = 2; i * i <= n; i++) {
      if (n % i === 0) {
        return false;
      }
    }

    return true;
  }

  static override readonly recommendedStartValues = PrimeGenerator.primes.slice(
    0,
    100,
  );

  protected override _rootMidi!: number;
  protected override _toneRange!: number;
  protected override _startValue!: number;
  protected override _reverse!: boolean;

  init(
    rootMidi: number,
    toneRange: number,
    startValue: number | string = 2,
    reverse: boolean = false,
  ) {
    const index = PrimeGenerator.recommendedStartValues.indexOf(
      startValue as number,
    );

    this._rootMidi = rootMidi;
    this._toneRange = toneRange;
    this._startValue = index === -1 ? 0 : index;
    this._reverse = reverse;
  }

  protected nextNote(): number {
    const value = PrimeGenerator.primes[this._startValue + this._index];

    this._advanceIndex();

    const midi = this._rootMidi + this._getOffset(value);

    return PrimeGenerator.limitToMidi(midi);
  }
}
