import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../ui-form/ui-input/ui-input.component';
import { UiSelectsComponent } from '../../ui-form/ui-selects/ui-selects.component';
import { UiButtonComponent } from '../../ui-form/ui-button/ui-button.component';
import { UiLabelComponent } from '../../ui-form/ui-label/ui-label.component';
import { UiDivComponent } from '../../ui-layout/ui-div/ui-div.component';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'select' | 'password' | string;
  options?: any[];
}

@Component({
  selector: 'ui-entity-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    UiSelectsComponent,
    UiButtonComponent,
    UiLabelComponent,
    UiDivComponent,
  ],
  templateUrl: './ui-entity-form.component.html',
  styleUrls: ['./ui-entity-form.component.css'],
})
export class UiEntityFormComponent {
  @Input() model: any = {};
  private _fields: FieldDef[] = [];
  @Input()
  set fields(v: FieldDef[] | undefined) {
    this._fields = Array.isArray(v) ? this.normalizeFields(v) : [];
  }
  get fields(): FieldDef[] {
    return this._fields;
  }
  @Input() loading = false;
  @Input() errorMsg = '';
  @Input() successMsg = '';
  @Input() submitLabel = 'Guardar';
  @Input() title?: string;

  @Output() submit = new EventEmitter<any>();

  private normalizeFields(items: FieldDef[]): FieldDef[] {
    const seen = new Set<string>();
    return items.map((f, idx) => {
      const item = { ...(f || ({} as FieldDef)) } as FieldDef;
      let key = (item.key || '').toString().trim();
      if (!key) {
        // derive from label or fallback to index
        key = (item.label || `field_${idx}`).toString().trim().replace(/\s+/g, '_').toLowerCase();
      }
      // ensure uniqueness
      let base = key;
      let i = 1;
      while (seen.has(key)) {
        key = `${base}_${i++}`;
      }
      seen.add(key);
      item.key = key;
      return item;
    });
  }

  onSubmit(e?: Event) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    this.submit.emit(this.model);
  }
}
