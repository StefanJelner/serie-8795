import { CommonModule } from '@angular/common';
import { SlSelectDirective } from './directives/sl-select/sl-select.directive';
import { TranslatePipe } from './pipes/translate.pipe';

export const DEFAULT_IMPORTS = [
  CommonModule,
  TranslatePipe,
  SlSelectDirective,
] as const;
