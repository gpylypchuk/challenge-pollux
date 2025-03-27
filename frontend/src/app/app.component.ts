import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent],
  template: '<app-layout></app-layout>',
  styles: [],
})
export class AppComponent {
  title = 'Wallet Manager';
}
