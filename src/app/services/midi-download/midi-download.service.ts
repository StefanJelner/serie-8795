import { DOCUMENT } from '@angular/common';
import { inject, Renderer2, RendererFactory2 } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

type SaveFilePickerHandle = {
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type WindowWithSaveFilePicker =
  | (Window &
      typeof globalThis & {
        showSaveFilePicker?: (
          options?: unknown,
        ) => Promise<SaveFilePickerHandle>;
      })
  | null;

export class MidiDownloadService {
  private static readonly MIME_TYPE = 'audio/midi';
  private static readonly DEFAULT_EXTENSIONS = ['mid', 'midi'] as const;
  private static readonly FILENAME_REGEX = new RegExp(
    `\\.(?:${MidiDownloadService.DEFAULT_EXTENSIONS.join('|')})$`,
    'i',
  );
  private static readonly FALLBACK_DELAY = 1500; // ms

  private readonly _document = inject(DOCUMENT);
  private readonly _window: WindowWithSaveFilePicker =
    this._document.defaultView;
  private readonly _renderer: Renderer2 = inject(
    RendererFactory2,
  ).createRenderer(null, null);
  private readonly _i18nService = inject(I18nService);

  async download(midiBytes: Uint8Array, filename?: string): Promise<void> {
    if (this._window === null) {
      throw new Error('Window object is not available. Download not possible.');
    }

    const resolvedName =
      this._isValidMidiFilename(filename) === true
        ? filename
        : this._generateTimestampFilename();
    const blob = this._createMidiBlob(midiBytes);

    // Modern API with a "save as" dialog
    if (typeof this._window.showSaveFilePicker === 'function') {
      const handle = await this._window.showSaveFilePicker({
        suggestedName: resolvedName,
        types: [
          {
            description: this._i18nService.translate(
              'services.midiDownload.filetypeDescription',
            )(),
            accept: {
              [MidiDownloadService.MIME_TYPE]:
                MidiDownloadService.DEFAULT_EXTENSIONS.map(
                  (fileExtension) => `.${fileExtension}`,
                ),
            },
          },
        ],
      });
      const writable = await handle.createWritable();

      await writable.write(blob);
      await writable.close();

      return;
    }

    // Fallback: classic download via link + object URL
    const url = this._window.URL.createObjectURL(blob);
    try {
      const $a = this._renderer.createElement('a') as HTMLAnchorElement;

      this._renderer.setAttribute($a, 'href', url);
      this._renderer.setAttribute($a, 'download', resolvedName);
      this._renderer.setAttribute($a, 'rel', 'noopener');
      this._renderer.appendChild(this._document.body, $a);

      $a.click();

      await new Promise<void>((resolve) =>
        setTimeout(resolve, MidiDownloadService.FALLBACK_DELAY),
      );

      this._renderer.removeChild(this._document.body, $a);
    } finally {
      this._window.URL.revokeObjectURL(url);
    }
  }

  private _createMidiBlob(midiBytes: Uint8Array): Blob {
    return new Blob([midiBytes.slice().buffer], {
      type: MidiDownloadService.MIME_TYPE,
    });
  }

  private _pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  private _generateTimestampFilename(date: Date = new Date()): string {
    // prettier-ignore
    return `${
      date.getFullYear()
    }-${
      this._pad2(date.getMonth() + 1)
    }-${
      this._pad2(date.getDate())
    }-${
      this._pad2(date.getHours())
    }-${
      this._pad2(date.getMinutes())
    }-${
      this._pad2(date.getSeconds())
    }.${
      MidiDownloadService.DEFAULT_EXTENSIONS[0]
    }`;
  }

  private _isValidMidiFilename(filename?: string | null): filename is string {
    if (filename === undefined || filename === null) {
      return false;
    }

    return MidiDownloadService.FILENAME_REGEX.test(filename);
  }
}
