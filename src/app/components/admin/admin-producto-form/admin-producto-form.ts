import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  forkJoin
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  AdminProductosService,
  AdminCategoria,
  AdminSectorFormulario,
  AdminProducto,
  NuevoProducto
} from '../../../services/admin-productos';


@Component({
  selector: 'app-admin-producto-form',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl:
    './admin-producto-form.html',

  styleUrl:
    './admin-producto-form.css'
})
export class AdminProductoFormComponent
  implements OnInit, OnDestroy {


  // =====================================================
  // CONFIGURACIÓN
  // =====================================================

 private readonly backendUrl =
  environment.apiUrl.replace(
    /\/api\/?$/,
    ''
  );


  // =====================================================
  // MODO CREAR / EDITAR
  // =====================================================

  modoEdicion = false;

  productoId: number | null = null;


  // =====================================================
  // CATÁLOGOS
  // =====================================================

  categorias: AdminCategoria[] = [];

  sectores: AdminSectorFormulario[] = [];


  // =====================================================
  // ESTADOS
  // =====================================================

  cargando = true;

  guardando = false;

  error = '';


  // =====================================================
  // ARCHIVOS NUEVOS
  // =====================================================

  archivoImagen: File | null = null;

  archivoFichaTecnica: File | null = null;


  // =====================================================
  // ARCHIVOS ACTUALES
  //
  // Se utilizan cuando estamos editando.
  // =====================================================

  imagenActualUrl: string | null = null;

  fichaActualUrl: string | null = null;


  // =====================================================
  // PREVIEW DE NUEVA IMAGEN
  // =====================================================

  previewImagen: string | null = null;


  // =====================================================
  // DRAG & DROP
  // =====================================================

  arrastrandoImagen = false;

  arrastrandoFicha = false;


  // =====================================================
  // LÍMITES
  // =====================================================

  readonly maxImagenBytes =
    5 * 1024 * 1024;

  readonly maxFichaBytes =
    10 * 1024 * 1024;


  // =====================================================
  // PRODUCTO
  // =====================================================

  producto: NuevoProducto = {

    categoria_id: null,

    nombre: '',

    descripcion: '',

    ficha_tecnica_url: null,

    imagen_url: null,

    slug: '',

    activo: 1,

    sectores: [],

    variaciones: [
      {
        talla: '',
        sku: '',
        precio: 0,
        stock: 0,
        activo: 1
      }
    ]

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private adminProductosService:
      AdminProductosService,

    private route:
      ActivatedRoute,

    private router:
      Router,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.detectarModo();

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.liberarPreviewImagen();

  }


  // =====================================================
  // DETECTAR CREAR / EDITAR
  // =====================================================

  private detectarModo(): void {

    const idParametro =
      this.route.snapshot.paramMap.get(
        'id'
      );


    if (!idParametro) {

      this.modoEdicion = false;

      this.productoId = null;

      this.cargarDatosNuevoProducto();

      return;

    }


    const id =
      Number(idParametro);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      this.error =
        'El identificador del producto no es válido.';

      this.cargando = false;

      return;

    }


    this.modoEdicion = true;

    this.productoId = id;

    this.cargarDatosEdicion(id);

  }


  // =====================================================
  // CARGAR DATOS PARA NUEVO PRODUCTO
  // =====================================================

  private cargarDatosNuevoProducto(): void {

    this.cargando = true;

    this.error = '';


    forkJoin({

      categorias:
        this.adminProductosService
          .obtenerCategorias(),

      sectores:
        this.adminProductosService
          .obtenerSectores()

    }).subscribe({

      next: ({
        categorias,
        sectores
      }) => {

        this.categorias =
          categorias || [];


        this.sectores =
          (sectores || [])
            .filter(
              sector =>
                Number(
                  sector.activo
                ) === 1
            );


        this.cargando = false;

        this.cdr.detectChanges();

      },


      error: (error) => {

        console.error(
          'Error cargando datos:',
          error
        );


        this.manejarErrorCarga(
          error
        );

      }

    });

  }


  // =====================================================
  // CARGAR DATOS PARA EDICIÓN
  // =====================================================

  private cargarDatosEdicion(
    id: number
  ): void {

    this.cargando = true;

    this.error = '';


    forkJoin({

      categorias:
        this.adminProductosService
          .obtenerCategorias(),

      sectores:
        this.adminProductosService
          .obtenerSectores(),

      producto:
        this.adminProductosService
          .obtenerProductoPorId(id)

    }).subscribe({

      next: ({
        categorias,
        sectores,
        producto
      }) => {

        // ===============================================
        // CATEGORÍAS
        // ===============================================

        this.categorias =
          categorias || [];


        // ===============================================
        // SECTORES
        // ===============================================

        this.sectores =
          (sectores || [])
            .filter(
              sector =>
                Number(
                  sector.activo
                ) === 1
            );


        // ===============================================
        // CARGAR PRODUCTO
        // ===============================================

        this.cargarProductoEnFormulario(
          producto
        );


        this.cargando = false;

        this.cdr.detectChanges();

      },


      error: (error) => {

        console.error(
          'Error cargando producto:',
          error
        );


        this.manejarErrorCarga(
          error
        );

      }

    });

  }


  // =====================================================
  // PASAR PRODUCTO DEL BACKEND AL FORMULARIO
  // =====================================================

  private cargarProductoEnFormulario(
    productoBackend: AdminProducto
  ): void {

    // ===================================================
    // SECTORES
    // ===================================================

    const sectoresSeleccionados =
      (productoBackend.sectores || [])
        .map(
          sector =>
            Number(
              sector.sector_id
            )
        )
        .filter(
          id =>
            Number.isInteger(id)
        );


    // ===================================================
    // VARIACIONES
    // ===================================================

    const variaciones =
      (productoBackend.variaciones || [])
        .map(
          variacion => ({

            talla:
              variacion.talla || '',

            sku:
              variacion.sku || '',

            precio:
              Number(
                variacion.precio || 0
              ),

            stock:
              Number(
                variacion.stock || 0
              ),

            activo:
              Number(
                variacion.activo
              ) === 1
                ? 1
                : 0

          })
        );


    // ===================================================
    // PRODUCTO
    // ===================================================

    this.producto = {

      categoria_id:
        productoBackend.categoria_id !== null
          ? Number(
              productoBackend.categoria_id
            )
          : null,

      nombre:
        productoBackend.nombre || '',

      descripcion:
        productoBackend.descripcion || '',

      ficha_tecnica_url:
        productoBackend.ficha_tecnica_url,

      imagen_url:
        productoBackend.imagen_url,

      slug:
        productoBackend.slug || '',

      activo:
        Number(
          productoBackend.activo
        ) === 1
          ? 1
          : 0,

      sectores:
        sectoresSeleccionados,

      variaciones:
        variaciones.length > 0
          ? variaciones
          : [
              {
                talla: '',
                sku: '',
                precio: 0,
                stock: 0,
                activo: 1
              }
            ]

    };


    // ===================================================
    // ARCHIVOS EXISTENTES
    // ===================================================

    this.imagenActualUrl =
      productoBackend.imagen_url || null;


    this.fichaActualUrl =
      productoBackend.ficha_tecnica_url || null;

  }


  // =====================================================
  // ERROR AL CARGAR
  // =====================================================

  private manejarErrorCarga(
    error: any
  ): void {

    this.cargando = false;


    if (error.status === 401) {

      this.error =
        'Tu sesión ha expirado. Inicia sesión nuevamente.';

    } else if (
      error.status === 404
    ) {

      this.error =
        'El producto que intentas editar no existe.';

    } else {

      this.error =
        'No se pudieron cargar los datos del producto.';

    }


    this.cdr.detectChanges();

  }


  // =====================================================
  // TÍTULO
  // =====================================================

  get tituloFormulario(): string {

    return this.modoEdicion
      ? 'Editar producto'
      : 'Nuevo producto';

  }


  // =====================================================
  // TEXTO BOTÓN
  // =====================================================

  get textoBotonGuardar(): string {

    return this.modoEdicion
      ? 'Guardar cambios'
      : 'Crear producto';

  }


  // =====================================================
  // GENERAR SLUG
  // =====================================================

  generarSlug(): void {

    if (!this.producto.nombre) {
      return;
    }


    this.producto.slug =
      this.producto.nombre

        .trim()

        .toLowerCase()

        .normalize('NFD')

        .replace(
          /[\u0300-\u036f]/g,
          ''
        )

        .replace(
          /[^a-z0-9]+/g,
          '-'
        )

        .replace(
          /^-+|-+$/g,
          ''
        );

  }


  // =====================================================
  // SECTOR SELECCIONADO
  // =====================================================

  sectorSeleccionado(
    sectorId: number
  ): boolean {

    return this.producto.sectores
      .includes(
        Number(sectorId)
      );

  }


  // =====================================================
  // CAMBIAR SECTOR
  // =====================================================

  cambiarSector(
    sectorId: number,
    seleccionado: boolean
  ): void {

    const id =
      Number(sectorId);


    if (seleccionado) {

      if (
        !this.producto.sectores
          .includes(id)
      ) {

        this.producto.sectores.push(
          id
        );

      }

      return;

    }


    this.producto.sectores =
      this.producto.sectores.filter(
        sector =>
          sector !== id
      );

  }


  // =====================================================
  // AGREGAR VARIACIÓN
  // =====================================================

  agregarVariacion(): void {

    this.producto.variaciones.push({

      talla: '',

      sku: '',

      precio: 0,

      stock: 0,

      activo: 1

    });

  }


  // =====================================================
  // ELIMINAR VARIACIÓN
  // =====================================================

  eliminarVariacion(
    index: number
  ): void {

    if (
      this.producto.variaciones.length <= 1
    ) {

      return;

    }


    this.producto.variaciones.splice(
      index,
      1
    );

  }


  // =====================================================
  // CHECKBOX ACTIVO
  // =====================================================

  get productoActivo(): boolean {

    return Number(
      this.producto.activo
    ) === 1;

  }


  set productoActivo(
    valor: boolean
  ) {

    this.producto.activo =
      valor
        ? 1
        : 0;

  }


  // =====================================================
  // URL COMPLETA
  // =====================================================

  obtenerUrlArchivo(
    url: string | null
  ): string | null {

    if (!url) {
      return null;
    }


    // URL absoluta

    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {

      return url;

    }


    // URL relativa del backend

    return (
      this.backendUrl +
      (
        url.startsWith('/')
          ? url
          : `/${url}`
      )
    );

  }


  // =====================================================
  // IMAGEN QUE DEBE MOSTRARSE
  // =====================================================

  get imagenMostrada(): string | null {

    // Nueva imagen seleccionada

    if (this.previewImagen) {

      return this.previewImagen;

    }


    // Imagen que ya existe

    return this.obtenerUrlArchivo(
      this.imagenActualUrl
    );

  }


  // =====================================================
  // URL FICHA ACTUAL
  // =====================================================

  get fichaActualCompleta(): string | null {

    return this.obtenerUrlArchivo(
      this.fichaActualUrl
    );

  }


  // =====================================================
  // SELECCIONAR IMAGEN
  // =====================================================

  seleccionarImagen(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const archivo =
      input.files?.[0];


    if (!archivo) {
      return;
    }


    const valido =
      this.procesarImagen(
        archivo
      );


    if (!valido) {

      input.value = '';

    }

  }


  // =====================================================
  // PROCESAR IMAGEN
  // =====================================================

  private procesarImagen(
    archivo: File
  ): boolean {

    this.error = '';


    const tiposPermitidos = [

      'image/jpeg',

      'image/png',

      'image/webp'

    ];


    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      this.error =
        'La imagen debe ser JPG, PNG o WEBP.';

      return false;

    }


    if (
      archivo.size >
      this.maxImagenBytes
    ) {

      this.error =
        'La imagen no puede superar los 5 MB.';

      return false;

    }


    this.archivoImagen =
      archivo;


    this.liberarPreviewImagen();


    this.previewImagen =
      URL.createObjectURL(
        archivo
      );


    this.cdr.detectChanges();


    return true;

  }


  // =====================================================
  // DRAG OVER IMAGEN
  // =====================================================

  dragOverImagen(
    event: DragEvent
  ): void {

    event.preventDefault();

    event.stopPropagation();

    this.arrastrandoImagen =
      true;

  }


  // =====================================================
  // DRAG LEAVE IMAGEN
  // =====================================================

  dragLeaveImagen(
    event: DragEvent
  ): void {

    event.preventDefault();

    event.stopPropagation();

    this.arrastrandoImagen =
      false;

  }


  // =====================================================
  // DROP IMAGEN
  // =====================================================

  dropImagen(
    event: DragEvent
  ): void {

    event.preventDefault();

    event.stopPropagation();


    this.arrastrandoImagen =
      false;


    const archivo =
      event.dataTransfer
        ?.files?.[0];


    if (!archivo) {
      return;
    }


    this.procesarImagen(
      archivo
    );

  }


  // =====================================================
  // ELIMINAR NUEVA IMAGEN
  //
  // En edición vuelve a mostrar la imagen anterior.
  // =====================================================

  eliminarImagen(): void {

    this.archivoImagen =
      null;


    this.liberarPreviewImagen();


    this.cdr.detectChanges();

  }


  // =====================================================
  // LIBERAR PREVIEW
  // =====================================================

  private liberarPreviewImagen(): void {

    if (
      this.previewImagen &&
      this.previewImagen.startsWith(
        'blob:'
      )
    ) {

      URL.revokeObjectURL(
        this.previewImagen
      );

    }


    this.previewImagen =
      null;

  }


  // =====================================================
  // SELECCIONAR FICHA
  // =====================================================

  seleccionarFicha(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const archivo =
      input.files?.[0];


    if (!archivo) {
      return;
    }


    const valido =
      this.procesarFicha(
        archivo
      );


    if (!valido) {

      input.value = '';

    }

  }


  // =====================================================
  // PROCESAR FICHA
  // =====================================================

  private procesarFicha(
    archivo: File
  ): boolean {

    this.error = '';


    if (
      archivo.type !==
      'application/pdf'
    ) {

      this.error =
        'La ficha técnica debe ser un archivo PDF.';

      return false;

    }


    if (
      archivo.size >
      this.maxFichaBytes
    ) {

      this.error =
        'La ficha técnica no puede superar los 10 MB.';

      return false;

    }


    this.archivoFichaTecnica =
      archivo;


    this.cdr.detectChanges();


    return true;

  }


  // =====================================================
  // DRAG OVER FICHA
  // =====================================================

  dragOverFicha(
    event: DragEvent
  ): void {

    event.preventDefault();

    event.stopPropagation();

    this.arrastrandoFicha =
      true;

  }


  // =====================================================
  // DRAG LEAVE FICHA
  // =====================================================

  dragLeaveFicha(
    event: DragEvent
  ): void {

    event.preventDefault();

    event.stopPropagation();

    this.arrastrandoFicha =
      false;

  }


  // =====================================================
  // DROP FICHA
  // =====================================================

  dropFicha(
    event: DragEvent
  ): void {

    event.preventDefault();

    event.stopPropagation();


    this.arrastrandoFicha =
      false;


    const archivo =
      event.dataTransfer
        ?.files?.[0];


    if (!archivo) {
      return;
    }


    this.procesarFicha(
      archivo
    );

  }


  // =====================================================
  // ELIMINAR NUEVA FICHA
  //
  // La ficha anterior permanece intacta.
  // =====================================================

  eliminarFicha(): void {

    this.archivoFichaTecnica =
      null;


    this.cdr.detectChanges();

  }


  // =====================================================
  // FORMATEAR TAMAÑO
  // =====================================================

  formatearTamano(
    bytes: number
  ): string {

    if (bytes === 0) {

      return '0 KB';

    }


    if (
      bytes < 1024 * 1024
    ) {

      return (
        bytes / 1024
      ).toFixed(1) + ' KB';

    }


    return (
      bytes /
      (
        1024 * 1024
      )
    ).toFixed(2) + ' MB';

  }


  // =====================================================
  // GUARDAR
  // =====================================================

  guardar(): void {

    this.error = '';


    // ===================================================
    // EVITAR DOBLE CLICK
    // ===================================================

    if (this.guardando) {
      return;
    }


    // ===================================================
    // NOMBRE
    // ===================================================

    if (
      !this.producto.nombre.trim()
    ) {

      this.error =
        'Ingresa el nombre del producto.';

      return;

    }


    // ===================================================
    // CATEGORÍA
    // ===================================================

    if (
      !this.producto.categoria_id
    ) {

      this.error =
        'Selecciona una categoría.';

      return;

    }


    // ===================================================
    // SECTORES
    // ===================================================

    if (
      this.producto.sectores.length === 0
    ) {

      this.error =
        'Selecciona al menos un sector.';

      return;

    }


    // ===================================================
    // VARIACIONES
    // ===================================================

    if (
      this.producto.variaciones.length === 0
    ) {

      this.error =
        'Agrega al menos una variación.';

      return;

    }


    const variacionInvalida =
      this.producto.variaciones.some(
        variacion => {

          const precio =
            Number(
              variacion.precio
            );


          const stock =
            Number(
              variacion.stock
            );


          return (

            !variacion.talla.trim() ||

            !Number.isFinite(
              precio
            ) ||

            precio < 0 ||

            !Number.isInteger(
              stock
            ) ||

            stock < 0

          );

        }
      );


    if (variacionInvalida) {

      this.error =
        'Revisa las variaciones. La talla es obligatoria, el precio debe ser válido y el stock debe ser un número entero no negativo.';

      return;

    }


    // ===================================================
    // SLUG
    // ===================================================

    if (
      !this.producto.slug?.trim()
    ) {

      this.generarSlug();

    }


    // ===================================================
    // NORMALIZAR
    // ===================================================

    const productoGuardar:
      NuevoProducto = {

      categoria_id:
        Number(
          this.producto.categoria_id
        ),

      nombre:
        this.producto.nombre
          .trim(),

      descripcion:
        this.producto.descripcion
          ?.trim()
        || null,

      // Las URLs no se envían como archivos.
      // El backend conserva las actuales en edición
      // y genera las nuevas cuando recibe archivos.

      ficha_tecnica_url:
        null,

      imagen_url:
        null,

      slug:
        this.producto.slug
          ?.trim()
        || null,

      activo:
        Number(
          this.producto.activo
        ),

      sectores:
        this.producto.sectores
          .map(Number),

      variaciones:
        this.producto.variaciones
          .map(
            variacion => ({

              talla:
                variacion.talla
                  .trim(),

              sku:
                variacion.sku
                  ?.trim()
                || null,

              precio:
                Number(
                  variacion.precio
                ),

              stock:
                Number(
                  variacion.stock
                ),

              activo:
                Number(
                  variacion.activo
                )

            })
          )

    };


    this.guardando =
      true;


    // ===================================================
    // EDITAR
    // ===================================================

    if (
      this.modoEdicion &&
      this.productoId !== null
    ) {

      this.actualizarProducto(
        productoGuardar
      );

      return;

    }


    // ===================================================
    // CREAR
    // ===================================================

    this.crearProducto(
      productoGuardar
    );

  }


  // =====================================================
  // CREAR
  // =====================================================

  private crearProducto(
    productoGuardar: NuevoProducto
  ): void {

    this.adminProductosService
      .crearProducto(

        productoGuardar,

        this.archivoImagen,

        this.archivoFichaTecnica

      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Producto creado:',
            respuesta
          );


          this.guardando =
            false;


          this.router.navigate([
            '/admin/productos'
          ]);

        },


        error: (error) => {

          console.error(
            'Error creando producto:',
            error
          );


          this.guardando =
            false;


          this.mostrarErrorGuardado(
            error,
            'No se pudo crear el producto.'
          );

        }

      });

  }


  // =====================================================
  // ACTUALIZAR
  // =====================================================

  private actualizarProducto(
    productoGuardar: NuevoProducto
  ): void {

    if (
      this.productoId === null
    ) {

      this.guardando = false;

      this.error =
        'No se encontró el identificador del producto.';

      return;

    }


    this.adminProductosService
      .actualizarProducto(

        this.productoId,

        productoGuardar,

        this.archivoImagen,

        this.archivoFichaTecnica

      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Producto actualizado:',
            respuesta
          );


          this.guardando =
            false;


          this.router.navigate([
            '/admin/productos'
          ]);

        },


        error: (error) => {

          console.error(
            'Error actualizando producto:',
            error
          );


          this.guardando =
            false;


          this.mostrarErrorGuardado(
            error,
            'No se pudo actualizar el producto.'
          );

        }

      });

  }


  // =====================================================
  // MOSTRAR ERROR
  // =====================================================

  private mostrarErrorGuardado(

    error: any,

    mensajePredeterminado: string

  ): void {

    if (
      error.status === 401
    ) {

      this.error =
        'Tu sesión ha expirado. Inicia sesión nuevamente.';

      this.cdr.detectChanges();

      return;

    }


    this.error =

      error.error?.mensaje ||

      error.error?.error ||

      (
        typeof error.error ===
        'string'

          ? error.error

          : ''
      ) ||

      mensajePredeterminado;


    this.cdr.detectChanges();

  }

}