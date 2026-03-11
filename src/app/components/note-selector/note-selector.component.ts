import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-note-selector',
  imports: [],
  templateUrl: './note-selector.component.html',
  styleUrls: ['./note-selector.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NoteSelectorComponent {
  public octave = signal<number | null>(null);
  public semitone = signal<number | null>(null);

  public readonly noteChange = output<number | null>();

  public readonly octaves = Array.from({ length: 11 }, (_, i) => i - 1); // -1 to 9
  public readonly semitones = [
    'C',
    'C#/Db',
    'D',
    'D#/Eb',
    'E',
    'F',
    'F#/Gb',
    'G',
    'G#/Ab',
    'A',
    'A#/Bb',
    'B',
  ];

  public readonly midi = computed(() => {
    const o = this.octave();
    const s = this.semitone();

    if (o === null || s === null) {
      return null;
    }

    const midi = (o + 1) * 12 + s;
    return midi >= 0 && midi <= 127 ? midi : null;
  });

  constructor() {
    effect(() => {
      this.noteChange.emit(this.midi());
    });
  }

  public setOctave(octave: string) {
    if (octave === '') {
      this.octave.set(null);

      return;
    }

    const o = Number(octave);
    this.octave.set(o);

    if (o === 9) {
      const s = this.semitone();

      if (s !== null && s > 7) {
        this.semitone.set(7);
      }
    }
  }

  public setSemitone(semitone: string) {
    if (semitone === '') {
      this.semitone.set(null);

      return;
    }

    this.semitone.set(Number(semitone));
  }
}
