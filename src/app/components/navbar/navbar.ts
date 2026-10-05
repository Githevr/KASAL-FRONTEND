import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { CarritoService } from '../../services/carrito';

@Component({
  selector: 'app-navbar',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {

  cantidadCarrito: number = 0;

  constructor(
    private carritoService: CarritoService
  ) {}


  ngOnInit(): void {

    this.carritoService.carrito$.subscribe(items => {

      this.cantidadCarrito = items.reduce(
        (total, item) => total + item.cantidad,
        0
      );

    });

  }

}