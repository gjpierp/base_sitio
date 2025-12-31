import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ui-header-public',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ui-header-public.component.html',
  styleUrl: './ui-header-public.component.css',
})
export class UiHeaderPublicComponent {}
