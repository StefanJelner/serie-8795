import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Generators } from '../../generators/generators';
import { Bars } from '../../models/scheduler.models';
import { SchedulerService } from '../../services/scheduler/scheduler.service';
import { TimingService } from '../../services/timing/timing.service';
import { BarsSelectorComponent } from '../bars-selector/bars-selector.component';
import { TrackComponent } from '../track/track.component';
import { TransportToolbarComponent } from '../transport-toolbar/transport-toolbar.component';

@Component({
  selector: 'app-sequencer',
  imports: [
    CommonModule,
    AsyncPipe,
    BarsSelectorComponent,
    TrackComponent,
    TransportToolbarComponent,
  ],
  providers: [SchedulerService],
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SequencerComponent {
  private readonly _schedulerService: SchedulerService =
    inject(SchedulerService);
  public readonly tracks$ = this._schedulerService.tracks$();
  public readonly bpm$ = this._schedulerService.bpm$();
  public readonly bars$ = this._schedulerService.bars$();

  TimingService = TimingService;

  constructor() {
    console.log(Generators);
  }

  public updateBpm(bpm: number): void {
    this._schedulerService.setBpm(bpm);
  }

  public updateBars(bars: Bars | null): void {
    if (bars === null) {
      return;
    }

    this._schedulerService.setBars(bars);
  }
}
