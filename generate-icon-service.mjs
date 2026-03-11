import c from 'ansi-colors';
import fse from 'fs-extra';
import { globSync } from 'glob';
import path from 'path';
import prettier from 'prettier';

const icons = globSync('./src/app/assets/icons/**/*.svg', {
  dotRelative: true,
  posix: true,
}).reduce((acc, icon) => {
  console.log(c.green(`Processing ${icon}`));

  const chunks = icon.split('/');
  const library = chunks[chunks.length - 2];
  const name = chunks[chunks.length - 1].replace(/\.svg$/, '');

  return {
    ...acc,
    [`${library}.${name}`]: fse
      .readFileSync(path.resolve(icon), 'utf-8')
      .replace(/class="[^"]*"/g, '')
      .replace(
        /(<svg\s+)/g,
        `$1class="icon icon--${library} icon--${name} icon--${library}-${name}" `,
      ),
  };
}, {});

const prettierRc = JSON.parse(
  fse.readFileSync(path.resolve('./.prettierrc'), 'utf8'),
);

const prettierPromise = prettier.format(
  `
// AUTOMATICALLY GENERATED FILE. DO NOT EDIT!

import { Injectable } from '@angular/core';
import { registerIconLibrary } from '@shoelace-style/shoelace/dist/utilities/icon-library.js';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private _icons: Record<string, string> = ${JSON.stringify(icons)};

  constructor() {
    registerIconLibrary('custom', {
      resolver: (icon) => {
        if (!this._icons[icon]) {
          console.warn(\`Icon \${icon} not found.\`);

          return '';
        }

        return \`data:image/svg+xml,\${encodeURIComponent(this._icons[icon])}\`;
      }
    });
  }
}
`,
  {
    ...prettierRc,
    parser: 'typescript',
  },
);

prettierPromise.then((prettifiedCode) => {
  fse.outputFileSync(
    path.resolve('./src/app/services/icon/icon-service.ts'),
    prettifiedCode,
  );
});
