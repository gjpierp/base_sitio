import Swal, { SweetAlertOptions } from 'sweetalert2';

export interface SwalFormField {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  required?: boolean;
  options?: { value: string | number; label: string }[];
}

export async function swalForm(
  title: string,
  fields: SwalFormField[],
  options?: SweetAlertOptions
): Promise<any | null> {
  const html = fields
    .map((f) => {
      if (f.type === 'select' && f.options) {
        return `
          <div class="swal2-form-row">
            <label for="swal-input-${f.key}">${f.label}</label>
            <select id="swal-input-${f.key}" class="swal2-input input">
              ${f.options
                .map(
                  (opt) =>
                    `<option value="${opt.value}"${opt.value == f.value ? ' selected' : ''}>${
                      opt.label
                    }</option>`
                )
                .join('')}
            </select>
          </div>
        `;
      }
      return `
        <div class="swal2-form-row">
          <label for="swal-input-${f.key}">${f.label}</label>
          <input id="swal-input-${f.key}" class="swal2-input" placeholder="${
        f.placeholder || f.label
      }"
            type="${f.type || 'text'}" value="${f.value ?? ''}" ${f.required ? 'required' : ''}>
        </div>
      `;
    })
    .join('');

  const result = await Swal.fire({
    title,
    html,
    customClass: {
      popup: 'swal2-popup',
      title: 'swal2-title',
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel',
    },
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const values: any = {};
      for (const f of fields) {
        let el = document.getElementById(`swal-input-${f.key}`);
        if (f.type === 'select') {
          values[f.key] = (el as HTMLSelectElement)?.value ?? '';
        } else {
          values[f.key] = (el as HTMLInputElement)?.value ?? '';
        }
        if (f.required && !values[f.key]) {
          Swal.showValidationMessage(`El campo '${f.label}' es obligatorio`);
          return;
        }
      }
      return values;
    },
    ...options,
  });
  return result.value || null;
}
