import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * SharedModule
 * ------------
 * Reusable components, pipes, and directives shared across features.
 * Import this module into any feature module that needs shared UI.
 */
@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [],
  exports: [CommonModule, FormsModule],
})
export class SharedModule {}

