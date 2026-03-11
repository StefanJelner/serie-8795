import { BehaviorSubject, Observable } from 'rxjs';
import { TransportState } from '../../models/scheduler.models';

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
