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

  CategoriaService,

  Categoria

} from '../../services/categoria';

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

  // =====================================================

  sectorActivo: string = '';

  categoriaActiva: string = '';

  // =====================================================

  // CATEGORÍAS Y SUBCATEGORÍAS

  // =====================================================

  categorias: Categoria[] = [];

  subcategorias: Categoria[] = [];

  subcategoriaActiva: string = '';

  cargandoCategorias: boolean = true;

  // =====================================================

  // CANTIDADES

  // =====================================================

  cantidadSeleccionada: {

    [producto_id: number]: number

  } = {};

  // =====================================================

  // SECTORES INDUSTRIALES

  // =====================================================

  sectores: string[] = [

    'Todos',

    'Agroindustria',

    'Minería',

    'Manufactura',

    'Metal/mecánica',

    'Construcción',

    'Pesca',

    'Alimentos',

    'Limpieza'

  ];

  sectorSeleccionado: string = 'Todos';

  // =====================================================

  // CONSTRUCTOR

  // =====================================================

  constructor(

    private productoService:

      ProductoService,

    private categoriaService:

      CategoriaService,

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

    // Cargar categorías públicas desde MySQL.

    this.cargarCategorias();

    // Escuchar los parámetros de la URL.

    //

    // /tienda

    // /tienda?categoria=guantes

    // /tienda?categoria=epps

    // /tienda?categoria=suministros

    // /tienda?sector=mineria

    this.route

      .queryParamMap

      .subscribe(params => {

        const sector =

          params.get('sector') || '';

        const categoria =

          params.get('categoria') || '';

        this.categoriaActiva =

          this.normalizarTexto(categoria);

        // Actualizar subcategorías cuando

        // cambie la categoría principal.

        this.actualizarSubcategorias();

        // Normalizar sector.

        this.sectorActivo =

          this.normalizarTexto(sector);

        // Mantener el comportamiento original

        // de carga de productos.

        this.cargarProductos();

      });

  }

  // =====================================================

  // CARGAR CATEGORÍAS PÚBLICAS

  // =====================================================

  private cargarCategorias(): void {

    this.cargandoCategorias = true;

    this.categoriaService

      .obtenerCategorias()

      .subscribe({

        next: (categorias: Categoria[]) => {

          if (!Array.isArray(categorias)) {

            console.error(

              'La API no devolvió un array de categorías:',

              categorias

            );

            this.categorias = [];

          } else {

            this.categorias = [

              ...categorias

            ];

          }

          this.actualizarSubcategorias();
          this.filtrarProductosPorCategoria();

          this.cargandoCategorias = false;

          console.log(

            'Categorías recibidas:',

            this.categorias

          );

          console.log(

            'Subcategorías disponibles:',

            this.subcategorias

          );

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(

            'Error al cargar categorías:',

            error

          );

          this.categorias = [];

          this.subcategorias = [];

          this.cargandoCategorias = false;

          this.cdr.detectChanges();

        }

      });

  }

  // =====================================================

  // OBTENER SUBCATEGORÍAS DE LA CATEGORÍA PRINCIPAL

  // =====================================================

  private actualizarSubcategorias(): void {

    const categoriaPrincipal =

      this.categorias.find(

        categoria =>

          categoria.categoria_padre_id === null &&

          this.normalizarTexto(

            categoria.slug

          ) === this.categoriaActiva

      );

    if (!categoriaPrincipal) {

      this.subcategorias = [];

      return;

    }

    this.subcategorias =

      this.categorias.filter(

        categoria =>

          categoria.categoria_padre_id ===

          categoriaPrincipal.id

      );

  }

  // =====================================================

  // SELECCIONAR SUBCATEGORÍA

  // =====================================================

  seleccionarSubcategoria(

    subcategoria: Categoria

  ): void {

    this.subcategoriaActiva = subcategoria.slug;

    this.filtrarProductosPorCategoria();

    this.cdr.detectChanges();

  }

  // =====================================================

  // VOLVER A LAS SUBCATEGORÍAS

  // =====================================================

  volverASubcategorias(): void {

    this.subcategoriaActiva = '';

    this.filtrarProductosPorCategoria();

    this.cdr.detectChanges();

  }

  // =====================================================

  // FILTRAR PRODUCTOS POR CATEGORÍA Y SUBCATEGORÍA

  // =====================================================

  private filtrarProductosPorCategoria(): void {

    this.productosFiltrados = this.productos.filter(

      (producto: Producto) => {

        const categoriaPrincipal =

          this.normalizarTexto(

            producto.categoria_principal || ''

          );

        const categoriaProducto =

          this.normalizarTexto(

            producto.categoria || ''

          );

        // Filtrar por categoría principal.

        if (this.categoriaActiva) {
          const categoriaSeleccionada = this.categorias.find(
            categoria =>
              categoria.categoria_padre_id === null &&
              this.normalizarTexto(categoria.slug) === this.categoriaActiva
          );

          const coincidePrincipal = categoriaPrincipal === this.categoriaActiva;
          const coincideCategoriaDirecta =
            !this.subcategoriaActiva &&
            !!categoriaSeleccionada &&
            categoriaProducto === this.normalizarTexto(categoriaSeleccionada.nombre);

          if (!coincidePrincipal && !coincideCategoriaDirecta) {
            return false;
          }
        }

        // Filtrar por subcategoría seleccionada.

        if (this.subcategoriaActiva) {

          const subcategoriaSeleccionada =

            this.subcategorias.find(

              subcategoria =>

                subcategoria.slug ===

                this.subcategoriaActiva

            );

          if (!subcategoriaSeleccionada) {

            return false;

          }

          return (

            categoriaProducto ===

            this.normalizarTexto(

              subcategoriaSeleccionada.nombre

            )

          );

        }

        // Si hay subcategorías, mostrar en la página principal
        // únicamente los productos asignados directamente a ella.
        // Los productos de subcategorías se muestran al seleccionarlas.
        if (this.categoriaActiva && this.subcategorias.length > 0) {
          const categoriaSeleccionada = this.categorias.find(
            categoria =>
              categoria.categoria_padre_id === null &&
              this.normalizarTexto(categoria.slug) === this.categoriaActiva
          );

          return !!categoriaSeleccionada &&
            categoriaProducto === this.normalizarTexto(categoriaSeleccionada.nombre);
        }

        return true;

      }

    );

  }

  // =====================================================

  // CARGAR PRODUCTOS

  // =====================================================

  private cargarProductos(): void {

    this.cargando = true;

    this.cdr.detectChanges();

    // Sincronizar el sector seleccionado.

    this.sectorSeleccionado =

      this.sectorActivo

        ? this.obtenerNombreSector(

            this.sectorActivo

          )

        : 'Todos';

    // Consultar productos desde el backend.

    this.productoService

      .obtenerProductos(

        this.sectorActivo

      )

      .subscribe({

        next: (data: Producto[]) => {

          console.log(

            'Sector activo:',

            this.sectorActivo || 'todos'

          );

          console.log(

            'Productos recibidos:',

            data

          );

          // Validar respuesta.

          if (!Array.isArray(data)) {

            console.error(

              'La API no devolvió un array de productos:',

              data

            );

            this.productos = [];

            this.productosFiltrados = [];

            this.cantidadSeleccionada = {};

            this.cargando = false;

            this.cdr.detectChanges();

            return;

          }

          // Guardar productos.

          this.productos = [

            ...data

          ];

          // Filtrar por categoría principal.

          //

          // Se conserva este filtro mientras

          // preparamos la navegación visual

          // por subcategorías en catalogo.html.

          // =====================================================

          // FILTRAR POR CATEGORÍA Y SUBCATEGORÍA

          // =====================================================

          this.filtrarProductosPorCategoria();

          // Reiniciar cantidades.

          this.cantidadSeleccionada = {};

          this.productos.forEach(

            (producto: Producto) => {

              this.cantidadSeleccionada[

                producto.producto_id

              ] = 1;

            }

          );

          // Terminar carga.

          this.cargando = false;

          this.cdr.detectChanges();

          // Logs de comprobación.

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

        error: (error) => {

          console.error(

            'Error al obtener productos:',

            error

          );

          this.productos = [];

          this.productosFiltrados = [];

          this.cantidadSeleccionada = {};

          this.cargando = false;

          this.cdr.detectChanges();

        }

      });

  }

  // =====================================================

  // FILTRAR POR SECTOR

  // =====================================================

  filtrarPorSector(

    sector: string

  ): void {

    this.sectorSeleccionado =

      sector;

    if (sector === 'Todos') {

      this.sectorActivo = '';

    } else {

      this.sectorActivo =

        this.normalizarTexto(

          sector

        );

    }

    this.cargarProductos();

  }

  // =====================================================

  // OBTENER NOMBRE VISIBLE DEL SECTOR

  // =====================================================

  private obtenerNombreSector(

    sectorNormalizado: string

  ): string {

    const sectorEncontrado =

      this.sectores.find(

        sector =>

          this.normalizarTexto(

            sector

          ) === sectorNormalizado

      );

    return sectorEncontrado ||

      'Todos';

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

    if (nuevaCantidad < 1) {

      return;

    }

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

    if (!variacion) {

      console.warn(

        'El producto no tiene variaciones:',

        producto.nombre

      );

      return;

    }

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

    // URL externa completa.

    if (

      url.startsWith('http://') ||

      url.startsWith('https://')

    ) {

      return url;

    }

    // Imagen almacenada en el backend.

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

    // Imagen pública del frontend.

    return url;

  }

}
