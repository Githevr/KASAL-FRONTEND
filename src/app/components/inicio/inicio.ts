import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductoService } from '../../services/producto';
import { CarritoService } from '../../services/carrito';
import { Producto } from '../../models/producto';
import {
  environment
} from '../../../environments/environment';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {

  // =====================================================
  // URL DEL BACKEND
  // =====================================================

  private readonly backendUrl =
    environment.apiUrl.replace(
      /\/api\/?$/,
      ''
    );

  // =====================================================
  // CARRUSEL DE SECTORES
  // =====================================================

  @ViewChild('sectorCarousel')
  sectorCarousel!: ElementRef<HTMLDivElement>;


  // =====================================================
  // PRODUCTOS
  // =====================================================

  productosDestacados: Producto[] = [];

  cargandoProductos: boolean = true;


  // =====================================================
  // CANTIDADES
  // =====================================================

  cantidadSeleccionada: {
    [producto_id: number]: number
  } = {};


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
  private productoService: ProductoService,
  private carritoService: CarritoService,
  private cdr: ChangeDetectorRef
) {}


  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  ngOnInit(): void {

    this.cargarProductosDestacados();

  }


  // =====================================================
  // CARGAR PRODUCTOS DESTACADOS
  // =====================================================

  private cargarProductosDestacados(): void {

  this.cargandoProductos = true;

  this.productoService
    .obtenerProductos()
    .subscribe({

      next: (data: Producto[]) => {

        console.log(
          'Productos recibidos en Inicio:',
          data
        );

        if (
          Array.isArray(data) &&
          data.length > 0
        ) {

          this.productosDestacados = [
            ...data.slice(0, 3)
          ];

          this.inicializarCantidades();

        } else {

          console.warn(
            'La API no devolvió productos. Usando productos demo.'
          );

          this.cargarDemo();

        }

        this.cargandoProductos = false;

        // Forzar actualización de la vista
        this.cdr.detectChanges();

        console.log(
          'Productos destacados:',
          this.productosDestacados.length
        );

      },

      error: (error) => {

        console.error(
          'Error al cargar productos en Inicio:',
          error
        );

        this.cargarDemo();

        this.cargandoProductos = false;

        // Forzar actualización de la vista
        this.cdr.detectChanges();

      }

    });

}

  // =====================================================
  // INICIALIZAR CANTIDADES
  // =====================================================

  private inicializarCantidades(): void {

    this.cantidadSeleccionada = {};

    this.productosDestacados.forEach(
      (producto: Producto) => {

        this.cantidadSeleccionada[
          producto.producto_id
        ] = 1;

      }
    );

  }


  // =====================================================
  // CAMBIAR CANTIDAD
  // =====================================================

  cambiarCantidad(
    producto: Producto,
    cambio: number
  ): void {

    const variacion =
      producto.variaciones?.[0];


    if (!variacion) {
      return;
    }


    if (variacion.stock <= 0) {
      return;
    }


    const cantidadActual =
      this.cantidadSeleccionada[
        producto.producto_id
      ] || 1;


    const nuevaCantidad =
      cantidadActual + cambio;


    // Cantidad mínima
    if (nuevaCantidad < 1) {
      return;
    }


    // No superar stock disponible
    if (
      nuevaCantidad >
      variacion.stock
    ) {
      return;
    }


    this.cantidadSeleccionada[
      producto.producto_id
    ] = nuevaCantidad;

  }


  // =====================================================
  // AGREGAR AL CARRITO
  // =====================================================

  agregar(
    producto: Producto
  ): void {

    const variacion =
      producto.variaciones?.[0];


    // Validar variación
    if (!variacion) {

      console.warn(
        'Producto sin variaciones:',
        producto.nombre
      );

      return;

    }


    // Validar stock
    if (variacion.stock <= 0) {

      console.warn(
        'Producto sin stock:',
        producto.nombre
      );

      return;

    }


    const cantidad =
      this.cantidadSeleccionada[
        producto.producto_id
      ] || 1;


    const cantidadFinal =
      Math.min(
        cantidad,
        variacion.stock
      );


    // Agregar al carrito
    this.carritoService.agregarAlCarrito({

      variacion_id:
        variacion.variacion_id,

      producto_id:
        producto.producto_id,

      nombre:
        producto.nombre,

      talla:
        variacion.talla,

      precio:
        variacion.precio,

      cantidad:
        cantidadFinal,

      stock:
        variacion.stock,

      imagen_url:
        producto.imagen_url || ''

    });


    // Regresar cantidad a 1
    this.cantidadSeleccionada[
      producto.producto_id
    ] = 1;

  }


  // =====================================================
  // CARRUSEL DE SECTORES
  // =====================================================

  moverCarruselSectores(
    direccion: number
  ): void {

    if (!this.sectorCarousel) {
      return;
    }


    const carousel =
      this.sectorCarousel.nativeElement;


    const card =
      carousel.querySelector(
        '.sector-image-card'
      ) as HTMLElement | null;


    if (!card) {
      return;
    }


    // Obtener separación real entre tarjetas
    const estilos =
      window.getComputedStyle(carousel);

    const gap =
      parseFloat(
        estilos.columnGap ||
        estilos.gap ||
        '20'
      );


    // Ancho de una tarjeta + separación
    const desplazamiento =
      card.offsetWidth + gap;


    carousel.scrollBy({

      left:
        direccion *
        desplazamiento,

      behavior: 'smooth'

    });

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


    // Imagen pública almacenada en Angular
    return url;

  }


  // =====================================================
  // IMAGEN ROTA
  // =====================================================

  imagenError(
    event: Event
  ): void {

    const img =
      event.target as HTMLImageElement;


    img.onerror = null;


    img.src =
      'https://placehold.co/600x400?text=KASAL+INVERSIONES';

  }

  // =====================================================
  // PRODUCTOS DEMO
  // =====================================================

  private cargarDemo(): void {

    this.productosDestacados = [

      {
        producto_id: 1,

        nombre:
          'Guante de Nitrilo Pesado Industrial',

        categoria:
          'Minería',

        descripcion:
          'Alta resistencia a abrasión, aceites e hidrocarburos. Ideal para trabajo pesado.',

        imagen_url:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',

        variaciones: [
          {
            variacion_id: 1,
            producto_id: 1,
            talla: 'M',
            precio: 18.50,
            stock: 50
          }
        ]
      },


      {
        producto_id: 2,

        nombre:
          'Guante de Cuero Carnaza Reforzado',

        categoria:
          'Construcción',

        descripcion:
          'Protección térmica y mecánica para soldadura y manipulación de materiales gruesos.',

        imagen_url:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',

        variaciones: [
          {
            variacion_id: 2,
            producto_id: 2,
            talla: 'L',
            precio: 22.00,
            stock: 30
          }
        ]
      },


      {
        producto_id: 3,

        nombre:
          'Guante Anticorte Multiuso EN388',

        categoria:
          'Manufactura',

        descripcion:
          'Recubrimiento de poliuretano de alta sensibilidad táctil y máxima protección nivel 5.',

        imagen_url:
          'https://placehold.co/600x400?text=Guante+Anticorte+EN388',

        variaciones: [
          {
            variacion_id: 3,
            producto_id: 3,
            talla: 'M',
            precio: 15.00,
            stock: 100
          }
        ]
      }

    ];


    this.inicializarCantidades();

  }

}