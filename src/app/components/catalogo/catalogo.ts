import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  ProductoService
} from '../../services/producto';

import {
  CarritoService
} from '../../services/carrito';

import {
  Producto
} from '../../models/producto';

import {
  environment
} from '../../../environments/environment';


@Component({
  selector: 'app-catalogo',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class CatalogoComponent implements OnInit {

  // =====================================================
  // URL DEL BACKEND
  // =====================================================

  private readonly backendUrl =
    environment.apiUrl.replace(
      /\/api\/?$/,
      ''
    );


  // =====================================================
  // PRODUCTOS
  // =====================================================

  productos: Producto[] = [];

  productosFiltrados: Producto[] = [];

  cargando: boolean = true;


  // =====================================================
  // SECTOR ACTIVO
  //
  // Ejemplos:
  // /tienda
  // /tienda?sector=mineria
  // /tienda?sector=construccion
  // =====================================================

  sectorActivo: string = '';


  // =====================================================
  // CANTIDADES
  // =====================================================

  cantidadSeleccionada: {
    [producto_id: number]: number
  } = {};


  // =====================================================
  // CATEGORÍAS
  // =====================================================

  categorias: string[] = [
    'Todas',
    'Agroindustria',
    'Minería',
    'Manufactura',
    'Metal/mecánica',
    'Construcción',
    'Pesca',
    'Alimentos',
    'Limpieza'
  ];


  categoriaActiva: string = 'Todas';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private productoService:
      ProductoService,

    private carritoService:
      CarritoService,

    private route:
      ActivatedRoute,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  ngOnInit(): void {

    // Escuchar cambios en los parámetros de la URL:
    //
    // /tienda
    // /tienda?sector=mineria
    // /tienda?sector=construccion
    // /tienda?sector=limpieza

    this.route
      .queryParamMap
      .subscribe(params => {

        const sector =
          params.get('sector') || '';


        // Normalizar el sector recibido por URL

        this.sectorActivo =
          this.normalizarTexto(
            sector
          );


        // Cada vez que cambia el sector,
        // cargar nuevamente los productos.

        this.cargarProductos();

      });

  }


  // =====================================================
  // CARGAR PRODUCTOS
  // =====================================================

  private cargarProductos(): void {

    // Mostrar loader

    this.cargando = true;


    // Forzar actualización para mostrar
    // inmediatamente el estado de carga.

    this.cdr.detectChanges();


    // Al cambiar de sector,
    // regresar al filtro "Todas".

    this.categoriaActiva =
      'Todas';


    // ===================================================
    // CONSULTAR PRODUCTOS
    // ===================================================

    this.productoService
      .obtenerProductos(
        this.sectorActivo
      )
      .subscribe({

        // =================================================
        // RESPUESTA CORRECTA
        // =================================================

        next: (
          data: Producto[]
        ) => {

          console.log(
            'Sector activo:',
            this.sectorActivo || 'todos'
          );

          console.log(
            'Productos recibidos:',
            data
          );


          // ===============================================
          // VALIDAR RESPUESTA
          // ===============================================

          if (!Array.isArray(data)) {

            console.error(
              'La API no devolvió un array de productos:',
              data
            );

            this.productos = [];

            this.productosFiltrados = [];

            this.cantidadSeleccionada = {};

            this.cargando = false;


            // Actualizar vista

            this.cdr.detectChanges();

            return;

          }


          // ===============================================
          // GUARDAR PRODUCTOS
          // ===============================================

          this.productos = [
            ...data
          ];


          // ===============================================
          // MOSTRAR PRODUCTOS DEL SECTOR
          // ===============================================

          this.productosFiltrados = [
            ...data
          ];


          // ===============================================
          // REINICIAR CANTIDADES
          // ===============================================

          this.cantidadSeleccionada = {};


          this.productos.forEach(
            (producto: Producto) => {

              this.cantidadSeleccionada[
                producto.producto_id
              ] = 1;

            }
          );


          // ===============================================
          // TERMINAR CARGA
          // ===============================================

          this.cargando = false;


          // ===============================================
          // FORZAR ACTUALIZACIÓN DE LA VISTA
          // ===============================================

          this.cdr.detectChanges();


          // ===============================================
          // LOGS DE COMPROBACIÓN
          // ===============================================

          console.log(
            'cargando:',
            this.cargando
          );

          console.log(
            'Total productos:',
            this.productos.length
          );

          console.log(
            'Productos visibles:',
            this.productosFiltrados.length
          );

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error) => {

          console.error(
            'Error al obtener productos:',
            error
          );


          this.productos = [];

          this.productosFiltrados = [];

          this.cantidadSeleccionada = {};

          this.cargando = false;


          // Actualizar vista para retirar
          // el loader incluso si la API falla.

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // FILTRAR POR CATEGORÍA
  // =====================================================

  filtrarPorCategoria(
    categoria: string
  ): void {

    this.categoriaActiva =
      categoria;


    // ===================================================
    // TODAS
    // ===================================================

    if (
      categoria === 'Todas'
    ) {

      this.productosFiltrados = [
        ...this.productos
      ];

      return;

    }


    // ===================================================
    // NORMALIZAR CATEGORÍA
    // ===================================================

    const categoriaSeleccionada =
      this.normalizarTexto(
        categoria
      );


    // ===================================================
    // FILTRAR
    // ===================================================

    this.productosFiltrados =
      this.productos.filter(
        (producto: Producto) => {

          const categoriaProducto =
            this.normalizarTexto(
              producto.categoria || ''
            );


          return (
            categoriaProducto ===
            categoriaSeleccionada
          );

        }
      );

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
  // CAMBIAR CANTIDAD
  // =====================================================

  cambiarCantidad(
    producto: Producto,
    cambio: number
  ): void {

    const variacion =
      producto.variaciones?.[0];


    // ===================================================
    // VALIDAR VARIACIÓN
    // ===================================================

    if (!variacion) {

      return;

    }


    // ===================================================
    // VALIDAR STOCK
    // ===================================================

    if (
      variacion.stock <= 0
    ) {

      return;

    }


    // ===================================================
    // CANTIDAD ACTUAL
    // ===================================================

    const cantidadActual =
      this.cantidadSeleccionada[
        producto.producto_id
      ] || 1;


    const nuevaCantidad =
      cantidadActual + cambio;


    // ===================================================
    // MÍNIMO 1
    // ===================================================

    if (
      nuevaCantidad < 1
    ) {

      return;

    }


    // ===================================================
    // NO SUPERAR STOCK
    // ===================================================

    if (
      nuevaCantidad >
      variacion.stock
    ) {

      return;

    }


    // ===================================================
    // GUARDAR CANTIDAD
    // ===================================================

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


    // ===================================================
    // VALIDAR VARIACIÓN
    // ===================================================

    if (!variacion) {

      console.warn(
        'El producto no tiene variaciones:',
        producto.nombre
      );

      return;

    }


    // ===================================================
    // VALIDAR STOCK
    // ===================================================

    if (
      variacion.stock <= 0
    ) {

      console.warn(
        'Producto sin stock:',
        producto.nombre
      );

      return;

    }


    // ===================================================
    // CANTIDAD SELECCIONADA
    // ===================================================

    const cantidad =
      this.cantidadSeleccionada[
        producto.producto_id
      ] || 1;


    // ===================================================
    // PROTEGER CONTRA EXCESO DE STOCK
    // ===================================================

    const cantidadFinal =
      Math.min(
        cantidad,
        variacion.stock
      );


    // ===================================================
    // AGREGAR AL CARRITO
    // ===================================================

    this.carritoService
      .agregarAlCarrito({

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


    // ===================================================
    // REINICIAR CANTIDAD
    // ===================================================

        this.cantidadSeleccionada[
      producto.producto_id
    ] = 1;

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


    // ===================================================
    // URL EXTERNA COMPLETA
    // ===================================================

    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {

      return url;

    }


    // ===================================================
    // IMAGEN ALMACENADA EN EL BACKEND
    // ===================================================

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


    // ===================================================
    // IMAGEN PÚBLICA DEL FRONTEND
    // ===================================================

    return url;

  }

}