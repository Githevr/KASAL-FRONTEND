import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  CarritoService
} from '../../services/carrito';

import {
  ItemCarrito
} from '../../models/producto';


@Component({
  selector: 'app-carrito',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './carrito.html',

  styleUrl: './carrito.css'
})
export class CarritoComponent implements OnInit {


  // =====================================================
  // PRODUCTOS DEL CARRITO
  // =====================================================

  items: ItemCarrito[] = [];


  // =====================================================
  // TOTAL
  // =====================================================

  total: number = 0;


  // =====================================================
  // WHATSAPP
  // =====================================================

  telefonoWhatsApp: string =
    '51981327368';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private carritoService:
      CarritoService
  ) {}


  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  ngOnInit(): void {

    this.carritoService
      .carrito$
      .subscribe(
        (
          items: ItemCarrito[]
        ) => {

          this.items =
            items;


          this.total =
            this.carritoService
              .obtenerTotal();

        }
      );

  }


  // =====================================================
  // ELIMINAR PRODUCTO
  // =====================================================

  eliminar(
    variacion_id: number
  ): void {

    this.carritoService
      .eliminarDelCarrito(
        variacion_id
      );

  }


  // =====================================================
  // ENVIAR POR WHATSAPP
  // =====================================================

  enviarWhatsApp(): void {

    const url =
      this.carritoService
        .generarEnlaceWhatsApp(
          this.telefonoWhatsApp
        );


    window.open(
      url,
      '_blank'
    );

  }

}