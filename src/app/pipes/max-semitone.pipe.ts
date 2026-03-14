import { Pipe, PipeTransform } from '@angular/core';
import { TrackStateService } from '../services/track-state/track-state.service';

@Pipe({
  standalone: true,
  name: 'maxSemitone',
  pure: true,
})
export class MaxSemitonePipe implements PipeTransform {
  transform(octave: number | null, semitone: number | null): boolean {
    return TrackStateService.maxSemitone(octave, semitone);
  }
}
