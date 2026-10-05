import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  AdminProductosService,
  AdminProducto
} from '../../../services/admin-productos';


@Component({
  selector: 'app-admin-productos',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './admin-productos.html',

  styleUrl: './admin-productos.css'
})
export class AdminProductosComponent
  implements OnInit {


  // =====================================================
  // CONFIGURACIÓN
  // =====================================================

  private readonly backendUrl =
    'http://localhost:3000';


  // =====================================================
  // PRODUCTOS
  // =====================================================

  productos: AdminProducto[] = [];

  productosFiltrados: AdminProducto[] = [];

  cargando: boolean = true;

  error: string = '';


  // =====================================================
  // FILTROS
  // =====================================================

  busqueda: string = '';

  filtroEstado: string = 'todos';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private adminProductosService:
      AdminProductosService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  ngOnInit(): void {

    this.cargarProductos();

  }


  // =====================================================
  // CARGAR PRODUCTOS
  // =====================================================

  cargarProductos(): void {

    this.cargando = true;

    this.error = '';


    this.adminProductosService
      .obtenerProductos()
      .subscribe({

        next: (productos) => {

          console.log(
            'Productos administrativos:',
            productos
          );


          this.productos =
            Array.isArray(productos)
              ? [...productos]
              : [];


          this.aplicarFiltros();


          this.cargando = false;


          console.log(
            'Total productos:',
            this.productos.length
          );


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cargando productos administrativos:',
            error
          );


          this.productos = [];

          this.productosFiltrados = [];

          this.cargando = false;


          if (error.status === 401) {

            this.error =
              'Tu sesión no es válida. Inicia sesión nuevamente.';

          } else {

            this.error =
              'No se pudieron cargar los productos.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // OBTENER URL DE IMAGEN
  // =====================================================
  //
  // Tenemos actualmente dos posibles ubicaciones:
  //
  // 1. Imágenes antiguas del frontend:
  //
  //    /images/productos/guante.jpg
  //
  //    Angular las sirve desde:
  //    http://localhost:4200/images/...
  //
  //
  // 2. Imágenes nuevas subidas desde el administrador:
  //
  //    /uploads/productos/guante.jpg
  //
  //    Express las sirve desde:
  //    http://localhost:3000/uploads/...
  //
  // =====================================================

  obtenerImagenUrl(
    imagenUrl: string | null | undefined
  ): string {

    if (!imagenUrl) {

      return '';

    }


    const url =
      imagenUrl.trim();


    if (!url) {

      return '';

    }


    // ===================================================
    // YA ES UNA URL ABSOLUTA
    // ===================================================

    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {

      return url;

    }


    // ===================================================
    // ARCHIVO SUBIDO AL BACKEND
    // ===================================================

    if (
      url.startsWith('/uploads/')
    ) {

      return (
        `${this.backendUrl}${url}`
      );

    }


    // ===================================================
    // ARCHIVOS ANTIGUOS DEL FRONTEND
    // /images/productos/...
    // ===================================================

    return url;

  }


  // =====================================================
  // APLICAR FILTROS
  // =====================================================

  aplicarFiltros(): void {

    const texto =
      this.normalizarTexto(
        this.busqueda
      );


    this.productosFiltrados =
      this.productos.filter(
        (
          producto:
            AdminProducto
        ) => {


          // =============================================
          // BUSCADOR
          // =============================================

          const coincideBusqueda =

            !texto ||

            this.normalizarTexto(
              producto.nombre || ''
            ).includes(texto) ||

            this.normalizarTexto(
              producto.categoria || ''
            ).includes(texto) ||

            String(
              producto.producto_id
            ).includes(texto);


          // =============================================
          // ESTADO
          // =============================================

          let coincideEstado =
            true;


          if (
            this.filtroEstado ===
            'activos'
          ) {

            coincideEstado =
              Boolean(
                producto.activo
              );

          }


          if (
            this.filtroEstado ===
            'inactivos'
          ) {

            coincideEstado =
              !Boolean(
                producto.activo
              );

          }


          return (
            coincideBusqueda &&
            coincideEstado
          );

        }
      );

  }


  // =====================================================
  // LIMPIAR FILTROS
  // =====================================================

  limpiarFiltros(): void {

    this.busqueda = '';

    this.filtroEstado =
      'todos';

    this.aplicarFiltros();

  }


  // =====================================================
  // NORMALIZAR TEXTO
  // =====================================================

  private normalizarTexto(
    texto: string
  ): string {

    return texto

      .trim()

      .toLowerCase()

      .normalize('NFD')

      .replace(
        /[\u0300-\u036f]/g,
        ''
      );

  }


  // =====================================================
  // PRECIO MÍNIMO
  // =====================================================

  obtenerPrecioMinimo(
    producto: AdminProducto
  ): number {

    if (
      !producto.variaciones ||
      producto.variaciones.length === 0
    ) {

      return 0;

    }


    const precios =

      producto.variaciones

        .map(
          variacion =>
            Number(
              variacion.precio
            )
        )

        .filter(
          precio =>
            !Number.isNaN(
              precio
            )
        );


    if (
      precios.length === 0
    ) {

      return 0;

    }


    return Math.min(
      ...precios
    );

  }


  // =====================================================
  // STOCK TOTAL DE UN PRODUCTO
  // =====================================================

  obtenerStockTotal(
    producto: AdminProducto
  ): number {

    if (
      !producto.variaciones ||
      producto.variaciones.length === 0
    ) {

      return 0;

    }


    return producto.variaciones.reduce(

      (
        total,
        variacion
      ) => {

        return (

          total +

          Number(
            variacion.stock || 0
          )

        );

      },

      0

    );

  }


  // =====================================================
  // TOTAL DE STOCK
  // =====================================================

  obtenerStockGeneral(): number {

    return this.productos.reduce(

      (
        total,
        producto
      ) => {

        return (

          total +

          this.obtenerStockTotal(
            producto
          )

        );

      },

      0

    );

  }


  // =====================================================
  // PRODUCTOS ACTIVOS
  // =====================================================

  obtenerProductosActivos(): number {

    return this.productos.filter(

      producto =>
        Boolean(
          producto.activo
        )

    ).length;

  }


  // =====================================================
  // PRODUCTOS SIN STOCK
  // =====================================================

  obtenerProductosSinStock(): number {

    return this.productos.filter(

      producto =>
        this.obtenerStockTotal(
          producto
        ) <= 0

    ).length;

  }


  // =====================================================
  // CANTIDAD DE CATEGORÍAS
  // =====================================================

  obtenerTotalCategorias(): number {

    const categorias =

      this.productos

        .map(
          producto =>
            producto.categoria
        )

        .filter(
          categoria =>
            Boolean(
              categoria
            )
        );


    return new Set(
      categorias
    ).size;

  }


  // =====================================================
  // ACTIVAR / DESACTIVAR
  // =====================================================

  cambiarEstado(
    producto: AdminProducto
  ): void {

    this.error = '';


    const nuevoEstado =
      !Boolean(
        producto.activo
      );


    this.adminProductosService
      .cambiarEstado(

        producto.producto_id,

        nuevoEstado

      )
      .subscribe({

        next: () => {

          producto.activo =
            nuevoEstado
              ? 1
              : 0;


          this.aplicarFiltros();


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cambiando estado:',
            error
          );


          if (
            error.status === 401
          ) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          } else {

            this.error =
              'No se pudo cambiar el estado del producto.';

          }


          this.cdr.detectChanges();

        }

      });

  }

}