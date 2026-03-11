export class MidiOutputService {
  private midiAccess: MIDIAccess | null = null;
  private midiOutputs: ReadonlyArray<MIDIOutput> = [];
  private selectedOutput: MIDIOutput | null = null;

  public async init(): Promise<void> {
    try {
      this.midiAccess = await navigator.requestMIDIAccess();

      this.midiOutputs = Array.from(
        (
          this.midiAccess!.outputs as unknown as Iterable<MIDIOutput> & {
            values(): IterableIterator<MIDIOutput>;
          }
        ).values(),
      );

      if (this.midiOutputs.length > 0) {
        this.selectedOutput = this.midiOutputs[0];
      }
    } catch {
      // MIDI nicht verfügbar
    }
  }

  public getOutputs(): ReadonlyArray<MIDIOutput> {
    return this.midiOutputs;
  }

  public selectOutput(id: string): void {
    const out = this.midiOutputs.find((o) => {
      return o.id === id;
    });

    if (!out) {
      return;
    }

    this.selectedOutput = out;
  }

  public noteOn(
    channel: number,
    note: number,
    velocity: number,
    timeSeconds: number,
  ): void {
    if (!this.selectedOutput) {
      return;
    }

    const msg = [0x90 + channel, note, velocity];

    this.selectedOutput.send(msg, timeSeconds * 1000);
  }

  public noteOff(channel: number, note: number, timeSeconds: number): void {
    if (!this.selectedOutput) {
      return;
    }

    const msg = [0x80 + channel, note, 0];

    this.selectedOutput.send(msg, timeSeconds * 1000);
  }
}
