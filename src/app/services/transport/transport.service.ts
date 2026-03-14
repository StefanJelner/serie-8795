import { BehaviorSubject, Observable } from 'rxjs';

export enum TransportState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export class TransportService {
  private readonly _state$ = new BehaviorSubject<TransportState>(
    TransportState.STOPPED,
  );

  public state$(): Observable<TransportState> {
    return this._state$.asObservable();
  }

  public play(): void {
    this._state$.next(TransportState.PLAYING);
  }

  public pause(): void {
    this._state$.next(TransportState.PAUSED);
  }

  public stop(): void {
    this._state$.next(TransportState.STOPPED);
  }
}
