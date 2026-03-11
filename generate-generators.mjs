import c from 'ansi-colors';
import fse from 'fs-extra';
import { globSync } from 'glob';
import path from 'path';

const generators = globSync('./src/app/generators/**/*.generator.ts', {
  dotRelative: true,
  posix: true,
})
  .map((generator) => ({
    className: `${generator
      .replace(/^.*?\/([^\/]+)\.generator\.ts$/, '$1')
      .replace(/(^|-)(\w)/g, (_, __, p2) => p2.toUpperCase())}Generator`,
    importPath: generator
      .replace(/^\.\/src\/app\/generators\//, '')
      .replace(/\.ts$/, ''),
  }))
  .filter(({ className }) => className !== 'BaseGenerator')
  .sort((a, b) => a.importPath.localeCompare(b.importPath));

fse.outputFileSync(
  path.resolve('./src/app/generators/generators.ts'),
  `
// AUTOMATICALLY GENERATED FILE. DO NOT EDIT!

${generators
  .map(({ className, importPath }) => {
    console.log(c.green(`Processing ${className} in ${importPath}`));

    return `import { ${className} } from './${importPath}';`;
  })
  .join('\n')}

export const Generators = [
  ${generators.map(({ className }) => className).join(',\n  ')}
];
`,
);
