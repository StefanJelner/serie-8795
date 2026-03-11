export type ToneSpace = number[];

export const ToneSpaces: Record<string, ToneSpace> = {
  Ionian: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  WholeTone: [0, 2, 4, 6, 8, 10],
  HalfWhole: [0, 1, 3, 4, 6, 7, 9, 10],
  WholeHalf: [0, 2, 3, 5, 6, 8, 9, 11],
  PentatonicMajor: [0, 2, 4, 7, 9],
  PentatonicMinor: [0, 3, 5, 7, 10],
  Maj7: [0, 4, 7, 11],
  Dom7: [0, 4, 7, 10],
  Min7: [0, 3, 7, 10],
  Min7b5: [0, 3, 6, 10],
  Dim7: [0, 3, 6, 9],
  Chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  Tritone: [0, 6],
  Quart: [0, 5],
  Cluster3: [0, 1, 2],
  BluesHexatonic: [0, 3, 5, 6, 7, 10],
  BluesHeptatonic: [0, 3, 4, 5, 7, 10, 11],
  Mixolydian_b9_b13: [0, 1, 4, 5, 7, 8, 10],
  MixolydianSharp11: [0, 2, 4, 6, 7, 9, 10],
  Altered: [0, 1, 3, 4, 6, 8, 10],
  MelodicMinor: [0, 2, 3, 5, 7, 9, 11],
  Dorian_b2: [0, 1, 3, 5, 7, 9, 10],
  HarmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  BebopMajor: [0, 2, 4, 5, 7, 8, 9, 11],
};

export interface SpaceSegment {
  toneSpace: ToneSpace;
  holdCount: number;
}

export class BaseChordProgression {
  constructor(private readonly segments: SpaceSegment[]) {}

  getChordAt(index: number): ToneSpace {
    return this.segments[index % this.segments.length].toneSpace;
  }

  getLengthAt(index: number): number {
    return this.segments[index % this.segments.length].holdCount;
  }

  get length(): number {
    return this.segments.length;
  }
}
