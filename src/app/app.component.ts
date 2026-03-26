import { DOCUMENT } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/shoelace.js';
import i18nData from '../../i18n.json';
import { DEFAULT_IMPORTS } from './default-imports';
import { I18nService } from './services/i18n/i18n.service';
import { IconService } from './services/icon/icon-service';
import { Theme, ThemeService } from './services/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [...DEFAULT_IMPORTS, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  public readonly Theme = Theme;

  private readonly _document = inject(DOCUMENT);
  private readonly _html = this._document.documentElement;
  private readonly _themeService = inject(ThemeService);
  private readonly _i18nService = inject(I18nService);
  private readonly _titleService = inject(Title);
  // The icon service is not used anywhere in this component, but we need to
  // inject it here to ensure that the icons are registered when the app starts.
  private readonly _ = inject(IconService);

  public readonly theme = this._themeService.theme();
  public readonly locale = this._i18nService.locale();

  constructor() {
    this._i18nService.setData(i18nData);

    effect(() => {
      this._html.classList.remove('sl-theme-light', 'sl-theme-dark');
      this._html.classList.add(`sl-theme-${this.theme()}`);
    });

    effect(() => {
      this._html.setAttribute('lang', this.locale());
      this._html.setAttribute(
        'dir',
        this._i18nService.translate('direction')(),
      );
      this._titleService.setTitle(this._i18nService.translate('windowTitle')());
    });
  }

  onThemeChange(theme: Theme) {
    this._themeService.setTheme(theme);
  }

  onLocaleChange(locale: string) {
    this._i18nService.setLocale(locale);
  }
}
