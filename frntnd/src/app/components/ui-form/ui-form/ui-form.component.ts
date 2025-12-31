import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiFieldComponent, FieldDef } from '../ui-field/ui-field.component';
import { UiButtonComponent } from '../ui-button/ui-button.component';
import { UiCardComponent } from '../../ui-data/ui-card/ui-card.component';

@Component({
  selector: 'ui-form',
  standalone: true,
  imports: [CommonModule, FormsModule, UiFieldComponent, UiButtonComponent, UiCardComponent],
  templateUrl: './ui-form.component.html',
  styleUrls: ['./ui-form.component.css'],
})
export class UiFormComponent {
  private _fields: FieldDef[] = [];
  @Input()
  set fields(v: FieldDef[] | undefined) {
    this._fields = Array.isArray(v) ? this.normalizeFields(v) : [];
  }
  get fields(): FieldDef[] {
    return this._fields;
  }
  @Input() model: any = {};
  @Input() submitLabel = 'Guardar';
  @Input() loading = false;

  @Output() submit = new EventEmitter<any>();

  onSubmit(e?: Event) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    this.submit.emit(this.model);
  }

  private normalizeFields(items: FieldDef[]): FieldDef[] {
    const seen = new Set<string>();
    return items.map((f, idx) => {
      const item = { ...(f || ({} as FieldDef)) } as FieldDef;
      let key = (item.key || '').toString().trim();
      if (!key) {
        key = (item.label || `field_${idx}`).toString().trim().replace(/\s+/g, '_').toLowerCase();
      }
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
}
