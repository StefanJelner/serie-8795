import { BaseChordProgression } from '../../chord-progressions/base.chord-progressions';
import {
  BaseRandomChordProgressionGenerator,
  GeneratorType,
} from '../base.generator';

export class FisherYatesGenerator extends BaseRandomChordProgressionGenerator {
  static override readonly realName = 'Fisher Yates';
  static override readonly type = GeneratorType.RANDOM_CHORD_PROGRESSION;

  private _chordIndex = 0;
  private _noteInHold = 0;
  private _holdInSegment = 0;
  private _bag: number[] = [];

  constructor(
    private readonly _progression: BaseChordProgression,
    private readonly _rootMidi: number,
    private readonly _toneRange: number,
    private readonly _notesPerHold: number,
  ) {
    super();
  }

  protected nextNote(): number {
    const tonespace = this._progression.getChordAt(this._chordIndex);
    const holdCount = this._progression.getLengthAt(this._chordIndex);
    const pool = this.buildToneSpacePool(tonespace, this._toneRange);

    if (this._noteInHold === 0 || this._bag.length < this._notesPerHold) {
      this._bag = pool.slice();
    }

    const offset = this.fisherYates();
    const midi = FisherYatesGenerator.limitToMidi(this._rootMidi + offset);

    this._noteInHold++;

    if (this._noteInHold >= this._notesPerHold) {
      this._noteInHold = 0;
      this._holdInSegment++;

      if (this._holdInSegment >= holdCount) {
        this._holdInSegment = 0;
        this._chordIndex = (this._chordIndex + 1) % this._progression.length;
      }
    }

    return midi;
  }

  private fisherYates(): number {
    const lastIndex = this._bag.length - 1;
    const swapIndex = Math.floor(Math.random() * (lastIndex + 1));

    [this._bag[lastIndex], this._bag[swapIndex]] = [
      this._bag[swapIndex],
      this._bag[lastIndex],
    ];

    return this._bag.pop()!;
  }
}
