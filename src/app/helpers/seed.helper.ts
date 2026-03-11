export enum PrngType {
  MULBERRY32 = 'MULBERRY32',
  SFC32 = 'SFC32',
  XOSHIRO128SS = 'XOSHIRO128SS', // xoshiro128**
}

export class SeedHelper {
  public static createSeed(): string {
    const buf = new Uint32Array(2);

    crypto.getRandomValues(buf);

    return `${buf[0].toString(36)}-${buf[1].toString(36)}`;
  }

  // FNV-1a -> uint32
  public static hashToUint32(seed: string): number {
    let h = 2166136261;

    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }

    return h >>> 0;
  }

  /**
   * Expand a string into 4x uint32 for PRNGs that need 128-bit state.
   * We just hash with different suffixes.
   */
  public static hashToUint32x4(seed: string): [number, number, number, number] {
    return [
      this.hashToUint32(seed + '|0'),
      this.hashToUint32(seed + '|1'),
      this.hashToUint32(seed + '|2'),
      this.hashToUint32(seed + '|3'),
    ];
  }

  public static mulberry32(seedUint32: number): () => number {
    let a = seedUint32 >>> 0;

    return () => {
      a = (a + 0x6d2b79f5) >>> 0;

      let t = a;

      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  public static sfc32(
    a: number,
    b: number,
    c: number,
    d: number,
  ): () => number {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;

    return () => {
      const t = (a + b + d) >>> 0;

      d = (d + 1) >>> 0;
      a = (b ^ (b >>> 9)) >>> 0;
      b = (c + (c << 3)) >>> 0;
      c = ((c << 21) | (c >>> 11)) >>> 0;
      c = (c + t) >>> 0;

      return t / 4294967296;
    };
  }

  // xoshiro128** (needs 4x uint32 state)
  // rotl helper
  private static rotl(x: number, k: number): number {
    return ((x << k) | (x >>> (32 - k))) >>> 0;
  }

  public static xoshiro128ss(
    s0: number,
    s1: number,
    s2: number,
    s3: number,
  ): () => number {
    s0 >>>= 0;
    s1 >>>= 0;
    s2 >>>= 0;
    s3 >>>= 0;

    return () => {
      const result = Math.imul(this.rotl(Math.imul(s1, 5) >>> 0, 7), 9) >>> 0;

      const t = (s1 << 9) >>> 0;

      s2 ^= s0;
      s3 ^= s1;
      s1 ^= s2;
      s0 ^= s3;
      s2 ^= t;
      s3 = this.rotl(s3, 11);

      return result / 4294967296;
    };
  }

  public static prngFromSeed(
    seed: string,
    type: PrngType = PrngType.MULBERRY32,
  ): () => number {
    const normalized = seed.trim();

    switch (type) {
      case PrngType.SFC32: {
        const [a, b, c, d] = this.hashToUint32x4(normalized);
        return this.sfc32(a, b, c, d);
      }

      case PrngType.XOSHIRO128SS: {
        const [s0, s1, s2, s3] = this.hashToUint32x4(normalized);
        return this.xoshiro128ss(s0, s1, s2, s3);
      }

      case PrngType.MULBERRY32:
      default: {
        return this.mulberry32(this.hashToUint32(normalized));
      }
    }
  }
}
