import { inject, Pipe, PipeTransform, Signal } from '@angular/core';
import { I18nService } from '../services/i18n/i18n.service';

/**
 * # TranslatePipe
 *
 * The translation pipe. Important: every translation has to be used together with the async pipe!
 */
@Pipe({
  standalone: true,
  name: 'translate',
  pure: true,
})
export class TranslatePipe implements PipeTransform {
  private readonly _i18nService = inject(I18nService);

  /**
   * Returns the locale specific string - with placeholders replaced - as a readonly signal.
   *
   * @param key the key of the translation
   * @param variables variable values (for placeholders inside the translations)
   * @returns the locale specific string as a readonly signal
   */
  transform(key: string, variables?: Record<string, string>): Signal<string> {
    return this._i18nService.translate(key, variables);
  }
}
