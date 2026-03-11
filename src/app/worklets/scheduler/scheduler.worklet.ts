import type { TrackRuntimeState } from '../../models/scheduler.models';

interface MessageEvent<T = any> {
  data: T;
}
interface MessagePort {
  onmessage: ((event: MessageEvent<any>) => void) | null;
  postMessage(message: any): void;
}
declare abstract class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean;
}
declare function registerProcessor(
  name: string,
  processorCtor: new () => AudioWorkletProcessor,
): void;

class SchedulerWorklet extends AudioWorkletProcessor {
  private _runtimeState: TrackRuntimeState[] = [];
  private _trackCount = 0;

  constructor() {
    super();

    this.port.onmessage = (event) => {
      const data = event.data;

      if (!data || typeof data !== 'object') {
        return;
      }

      switch (data.type) {
        case 'init': {
          this._trackCount = Math.trunc(data.trackCount);

          this._runtimeState = Array.from({ length: this._trackCount }).map(
            () => ({
              nextStepIndex: 0,
              nextStepTime: 0,
              cycleCount: 0,
            }),
          );

          this.port.postMessage({
            type: 'position',
            runtime: this._runtimeState,
          });

          break;
        }

        case 'reset': {
          this._runtimeState = this._runtimeState.map(() => ({
            nextStepIndex: 0,
            nextStepTime: 0,
            cycleCount: 0,
          }));

          this.port.postMessage({
            type: 'position',
            runtime: this._runtimeState,
          });

          break;
        }

        case 'position-update': {
          if (Array.isArray(data.runtime)) {
            this._runtimeState = data.runtime;
            this.port.postMessage({
              type: 'position',
              runtime: this._runtimeState,
            });
          }

          break;
        }

        case 'schedule': {
          this._handleScheduleEvent(data);

          break;
        }

        default: {
          break;
        }
      }
    };
  }

  private _handleScheduleEvent(data: {
    track: number;
    stepIndex?: number;
    time?: number;
    cycleCount?: number;
  }): void {
    const trackIndex = Math.trunc(data.track);

    if (trackIndex < 0) {
      return;
    }

    if (this._runtimeState.length <= trackIndex) {
      const missing = trackIndex + 1 - this._runtimeState.length;
      this._runtimeState = this._runtimeState.concat(
        Array.from({ length: missing }).map(() => ({
          nextStepIndex: 0,
          nextStepTime: 0,
          cycleCount: 0,
        })),
      );
    }

    const prev = this._runtimeState[trackIndex];

    const nextStepIndex =
      typeof data.stepIndex === 'number'
        ? Math.trunc(data.stepIndex)
        : prev.nextStepIndex;

    const nextStepTime =
      typeof data.time === 'number' ? data.time : prev.nextStepTime;

    const cycleCount =
      typeof data.cycleCount === 'number'
        ? Math.trunc(data.cycleCount)
        : prev.cycleCount;

    this._runtimeState[trackIndex] = {
      nextStepIndex,
      nextStepTime,
      cycleCount,
    };

    this.port.postMessage({
      type: 'position',
      runtime: this._runtimeState,
    });
  }

  override process(): boolean {
    return true;
  }
}

registerProcessor('scheduler-worklet', SchedulerWorklet);
