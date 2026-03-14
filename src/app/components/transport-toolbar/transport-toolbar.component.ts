import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { DEFAULT_IMPORTS } from '../../default-imports';
import { SchedulerService } from '../../services/scheduler/scheduler.service';

@Component({
  selector: 'app-transport-toolbar',
  imports: [...DEFAULT_IMPORTS],
  templateUrl: './transport-toolbar.component.html',
  styleUrls: ['./transport-toolbar.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransportToolbarComponent {
  private _schedulerService = inject(SchedulerService);

  play(): void {
    this._schedulerService.play();
  }

  pause(): void {
    this._schedulerService.pause();
  }

  stop(): void {
    this._schedulerService.stop();
  }

  download(minutes: string, seconds: string, callback: () => void): void {
    const totalSeconds = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);

    if (isNaN(totalSeconds) || totalSeconds <= 0) {
      return;
    }

    this._schedulerService.downloadMidiFile(totalSeconds, callback);
  }
}
