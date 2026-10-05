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
  AdminCategoriasService,
  AdminCategoria,
  CategoriaPayload
} from '../../../services/admin-categorias';


@Component({
  selector: 'app-admin-categorias',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './admin-categorias.html',

  styleUrl:
    './admin-categorias.css'
})
export class AdminCategoriasComponent
  implements OnInit {


  // ===================================================
  // DATOS
  // ===================================================

  categorias: AdminCategoria[] = [];

  categoriasFiltradas:
    AdminCategoria[] = [];


  // ===================================================
  // ESTADOS
  // ===================================================

  cargando = true;

  guardando = false;

  error = '';

  mensajeExito = '';


  // ===================================================
  // BUSCADOR
  // ===================================================

  busqueda = '';


  // ===================================================
  // FORMULARIO
  // ===================================================

  mostrarFormulario = false;

  modoEdicion = false;

  categoriaEditandoId:
    number | null = null;


  formulario: CategoriaPayload = {

    nombre: '',

    slug: ''

  };


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private adminCategoriasService:
      AdminCategoriasService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    this.cargarCategorias();

  }


  // ===================================================
  // CARGAR CATEGORÍAS
  // ===================================================

  cargarCategorias(): void {

    this.cargando = true;

    this.error = '';


    this.adminCategoriasService
      .obtenerCategorias()
      .subscribe({

        next: (categorias) => {

          this.categorias =
            Array.isArray(categorias)
              ? categorias
              : [];


          this.aplicarFiltro();

          this.cargando = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cargando categorías:',
            error
          );


          this.categorias = [];

          this.categoriasFiltradas = [];

          this.cargando = false;


          if (error.status === 401) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          } else {

            this.error =
              'No se pudieron cargar las categorías.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // ===================================================
  // FILTRAR
  // ===================================================

  aplicarFiltro(): void {

    const texto =
      this.normalizarTexto(
        this.busqueda
      );


    this.categoriasFiltradas =
      this.categorias.filter(
        categoria => {

          if (!texto) {
            return true;
          }


          return (

            this.normalizarTexto(
              categoria.nombre
            ).includes(texto)

            ||

            this.normalizarTexto(
              categoria.slug
            ).includes(texto)

            ||

            String(
              categoria.id
            ).includes(texto)

          );

        }
      );

  }


  // ===================================================
  // NORMALIZAR TEXTO
  // ===================================================

  private normalizarTexto(
    texto: string
  ): string {

    return String(texto || '')

      .trim()

      .toLowerCase()

      .normalize('NFD')

      .replace(
        /[\u0300-\u036f]/g,
        ''
      );

  }


  // ===================================================
  // NUEVA CATEGORÍA
  // ===================================================

  nuevaCategoria(): void {

    this.error = '';

    this.mensajeExito = '';

    this.modoEdicion = false;

    this.categoriaEditandoId = null;


    this.formulario = {

      nombre: '',

      slug: ''

    };


    this.mostrarFormulario = true;

  }


  // ===================================================
  // EDITAR
  // ===================================================

  editarCategoria(
    categoria: AdminCategoria
  ): void {

    this.error = '';

    this.mensajeExito = '';

    this.modoEdicion = true;

    this.categoriaEditandoId =
      categoria.id;


    this.formulario = {

      nombre:
        categoria.nombre,

      slug:
        categoria.slug

    };


    this.mostrarFormulario = true;

  }


  // ===================================================
  // CANCELAR
  // ===================================================

  cancelarFormulario(): void {

    this.mostrarFormulario = false;

    this.modoEdicion = false;

    this.categoriaEditandoId = null;


    this.formulario = {

      nombre: '',

      slug: ''

    };

  }


  // ===================================================
  // GENERAR SLUG
  // ===================================================

  generarSlug(): void {

    if (
      !this.formulario.nombre.trim()
    ) {

      return;

    }


    this.formulario.slug =

      this.formulario.nombre

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


  // ===================================================
  // GUARDAR
  // ===================================================

  guardarCategoria(): void {

    this.error = '';

    this.mensajeExito = '';


    // ===============================================
    // NOMBRE
    // ===============================================

    if (
      !this.formulario.nombre.trim()
    ) {

      this.error =
        'Ingresa el nombre de la categoría.';

      return;

    }


    // ===============================================
    // SLUG
    // ===============================================

    if (
      !this.formulario.slug.trim()
    ) {

      this.generarSlug();

    }


    const datos: CategoriaPayload = {

      nombre:
        this.formulario.nombre.trim(),

      slug:
        this.formulario.slug.trim()

    };


    this.guardando = true;


    // ===============================================
    // EDITAR
    // ===============================================

    if (
      this.modoEdicion &&
      this.categoriaEditandoId !== null
    ) {

      this.adminCategoriasService
        .actualizarCategoria(
          this.categoriaEditandoId,
          datos
        )
        .subscribe({

          next: (respuesta) => {

            this.guardando = false;

            this.mensajeExito =
              respuesta.mensaje;


            this.cancelarFormulario();

            this.cargarCategorias();

          },


          error: (error) => {

            this.manejarErrorGuardado(
              error
            );

          }

        });


      return;

    }


    // ===============================================
    // CREAR
    // ===============================================

    this.adminCategoriasService
      .crearCategoria(datos)
      .subscribe({

        next: (respuesta) => {

          this.guardando = false;

          this.mensajeExito =
            respuesta.mensaje;


          this.cancelarFormulario();

          this.cargarCategorias();

        },


        error: (error) => {

          this.manejarErrorGuardado(
            error
          );

        }

      });

  }


  // ===================================================
  // ERROR AL GUARDAR
  // ===================================================

  private manejarErrorGuardado(
    error: any
  ): void {

    console.error(
      'Error guardando categoría:',
      error
    );


    this.guardando = false;


    if (error.status === 401) {

      this.error =
        'Tu sesión ha expirado. Inicia sesión nuevamente.';

    } else {

      this.error =
        error.error?.mensaje ||
        'No se pudo guardar la categoría.';

    }


    this.cdr.detectChanges();

  }

  // ===================================================
// CATEGORÍAS CON PRODUCTOS
// ===================================================

obtenerCategoriasConProductos(): number {

  return this.categorias.filter(
    categoria =>
      Number(
        categoria.total_productos || 0
      ) > 0
  ).length;

}


  // ===================================================
  // TOTAL PRODUCTOS
  // ===================================================

  obtenerTotalProductos(): number {

    return this.categorias.reduce(

      (
        total,
        categoria
      ) => {

        return (
          total +
          Number(
            categoria.total_productos || 0
          )
        );

      },

      0

    );

  }

}