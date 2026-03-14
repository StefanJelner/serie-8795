import {
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
} from '@angular/core';
import { SlSelect } from '@shoelace-style/shoelace';
import { I18nService } from '../../services/i18n/i18n.service';

/**
 * # SlSelectDirective
 *
 * Shoelace <sl-select> does not refresh the text of the chosen option
 * when the locale changes. This directive forces the component to
 * refresh. It is not elegant, but it gets the job done.
 */
@Directive({
  selector: 'sl-select[i18nRefresh]',
  standalone: true,
})
export class SlSelectDirective {
  private readonly _$el = inject(ElementRef<SlSelect>).nativeElement;
  private readonly _i18nService = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _locale = this._i18nService.locale();
  private _timeout: number | null = null;

  constructor() {
    effect(() => {
      this._locale();

      const prevValue = this._$el.value;

      if (prevValue !== '') {
        this._$el.value = '';

        this._timeout = window.setTimeout(() => {
          if (this._timeout !== null) {
            clearTimeout(this._timeout);

            this._timeout = null;
          }

          this._$el.value = prevValue;
        });
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this._timeout !== null) {
        clearTimeout(this._timeout);
      }
    });
  }
}
