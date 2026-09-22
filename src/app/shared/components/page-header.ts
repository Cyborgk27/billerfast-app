import { Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  imports: [MatButtonModule],
  template: `
    <div class="form-header">
      <button mat-icon-button (click)="back.emit()" aria-label="Volver">
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="page-title"><ng-content /></h1>
      <span class="header-extra"><ng-content select="[extra]" /></span>
    </div>
  `,
  styles: [
    `
      .form-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      .page-title {
        margin: 0;
        font-size: 22px;
        font-weight: 500;
        font-family: 'Poppins', sans-serif;
        flex: 1;
      }
      .header-extra {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
})
export class PageHeader {
  readonly back = output<void>();
}