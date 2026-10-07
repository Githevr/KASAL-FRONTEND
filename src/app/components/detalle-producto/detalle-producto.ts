import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductoService } from '../../services/producto';
import { CarritoService } from '../../services/carrito';
import { Producto, Variacion } from '../../models/producto';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css'
})
export class DetalleProductoComponent implements OnInit {

  private readonly backendUrl =
    environment.apiUrl.replace(
      /\/api\/?$/,
      ''
    );

  producto?: Producto;

  variacionSeleccionada?: Variacion;

  cantidad: number = 1;

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) return;

    this.productoService.obtenerProductoPorId(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.seleccionarPrimeraVariacion();
      },

      error: () => {
        this.cargarDemo(id);
      }
    });
  }

  private seleccionarPrimeraVariacion(): void {

    if (
      this.producto?.variaciones &&
      this.producto.variaciones.length > 0
    ) {
      this.variacionSeleccionada = this.producto.variaciones[0];
      this.cantidad = 1;
    }
  }

  seleccionarVariacion(variacion: Variacion): void {

    this.variacionSeleccionada = variacion;

    // Reiniciamos cantidad al cambiar de talla
    this.cantidad = 1;
  }

  cambiarCantidad(cambio: number): void {

    if (!this.variacionSeleccionada) return;

    const nuevaCantidad = this.cantidad + cambio;

    // No permitir menos de 1
    if (nuevaCantidad < 1) {
      return;
    }

    // No permitir superar el stock
    if (nuevaCantidad > this.variacionSeleccionada.stock) {
      return;
    }

        this.cantidad = nuevaCantidad;
  }


  // =====================================================
  // OBTENER URL DE IMAGEN DEL PRODUCTO
  // =====================================================

  obtenerImagenProducto(
    imagenUrl: string | null | undefined
  ): string {

    if (!imagenUrl) {
      return 'https://placehold.co/600x400?text=KASAL+INVERSIONES';
    }

    const url =
      imagenUrl.trim();

    // URL externa completa
    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {
      return url;
    }

    // Imagen almacenada en el backend
    if (
      url.startsWith('/uploads/') ||
      url.startsWith('uploads/')
    ) {

      const ruta =
        url.startsWith('/')
          ? url
          : `/${url}`;

      return `${this.backendUrl}${ruta}`;
    }

    // Imagen pública del frontend
    return url;
  }


  agregarAlCarrito(): void {

    if (
      !this.producto ||
      !this.variacionSeleccionada ||
      this.variacionSeleccionada.stock <= 0
    ) {
      return;
    }

    this.carritoService.agregarAlCarrito({
  variacion_id: this.variacionSeleccionada.variacion_id,
  producto_id: this.producto.producto_id,
  nombre: this.producto.nombre,
  talla: this.variacionSeleccionada.talla,
  precio: this.variacionSeleccionada.precio,
  cantidad: this.cantidad,
  stock: this.variacionSeleccionada.stock,
  imagen_url: this.producto.imagen_url || ''
});
  }

  cargarDemo(id: number): void {

    const demos: Producto[] = [
      {
        producto_id: 1,
        nombre: 'Guante de Nitrilo Pesado Industrial',
        categoria: 'Minería',
        descripcion:
          'Alta resistencia a abrasión, aceites e hidrocarburos. Ideal para trabajo pesado.',
        imagen_url:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80',

        variaciones: [
          {
            variacion_id: 1,
            producto_id: 1,
            talla: 'M',
            precio: 18.50,
            stock: 20
          },
          {
            variacion_id: 2,
            producto_id: 1,
            talla: 'L',
            precio: 19.50,
            stock: 15
          },
          {
            variacion_id: 3,
            producto_id: 1,
            talla: 'XL',
            precio: 21.00,
            stock: 8
          }
        ]
      },

      {
        producto_id: 2,
        nombre: 'Guante de Cuero Carnaza reforzado',
        categoria: 'Construcción',
        descripcion:
          'Protección térmica y mecánica para soldadura y manipulación de materiales gruesos.',
        imagen_url:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80',

        variaciones: [
          {
            variacion_id: 4,
            producto_id: 2,
            talla: 'M',
            precio: 22,
            stock: 10
          },
          {
            variacion_id: 5,
            producto_id: 2,
            talla: 'L',
            precio: 23,
            stock: 12
          },
          {
            variacion_id: 6,
            producto_id: 2,
            talla: 'XL',
            precio: 24.50,
            stock: 5
          }
        ]
      },

      {
        producto_id: 3,
        nombre: 'Guante Anticorte Multiuso EN388',
        categoria: 'Manufactura',
        descripcion:
          'Recubrimiento de poliuretano de alta sensibilidad táctil y máxima protección nivel 5.',
        imagen_url:
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=500&q=80',

        variaciones: [
          {
            variacion_id: 7,
            producto_id: 3,
            talla: 'M',
            precio: 15,
            stock: 30
          },
          {
            variacion_id: 8,
            producto_id: 3,
            talla: 'L',
            precio: 16,
            stock: 25
          },
          {
            variacion_id: 9,
            producto_id: 3,
            talla: 'XL',
            precio: 17,
            stock: 15
          }
        ]
      }
    ];

    this.producto =
      demos.find(p => p.producto_id === id) || demos[0];

    this.seleccionarPrimeraVariacion();
  }
}