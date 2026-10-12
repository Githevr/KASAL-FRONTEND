
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar';
import { CarritoComponent } from './components/carrito/carrito';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    CarritoComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'kasal-inversiones';

  constructor(public router: Router) {}

  get esRutaAdmin(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
