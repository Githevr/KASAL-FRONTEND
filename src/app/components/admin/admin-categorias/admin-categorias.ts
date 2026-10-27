
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

  templateUrl: './admin-categorias.html',

  styleUrl: './admin-categorias.css'
})
export class AdminCategoriasComponent implements OnInit {

  // ===================================================
  // DATOS
  // ===================================================

  categorias: AdminCategoria[] = [];

  categoriasFiltradas: AdminCategoria[] = [];

  // Solo categorías que no tienen padre
  categoriasPrincipales: AdminCategoria[] = [];


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

  categoriaEditandoId: number | null = null;

  formulario: CategoriaPayload = {
    nombre: '',
    slug: '',
    categoria_padre_id: null
  };


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(
    private adminCategoriasService: AdminCategoriasService,
    private cdr: ChangeDetectorRef
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

          this.categorias = Array.isArray(categorias)
            ? categorias
            : [];

          // Obtener únicamente categorías principales
          this.categoriasPrincipales = this.categorias.filter(
            categoria =>
              categoria.categoria_padre_id === null
          );

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

          this.categoriasPrincipales = [];

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

    const texto = this.normalizarTexto(
      this.busqueda
    );

    this.categoriasFiltradas = this.categorias.filter(
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

          ||

          this.normalizarTexto(
            categoria.categoria_padre_nombre || ''
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
      slug: '',
      categoria_padre_id: null
    };

    this.mostrarFormulario = true;
  }


  // ===================================================
  // EDITAR CATEGORÍA
  // ===================================================

  editarCategoria(
    categoria: AdminCategoria
  ): void {

    this.error = '';

    this.mensajeExito = '';

    this.modoEdicion = true;

    this.categoriaEditandoId = categoria.id;

    this.formulario = {
      nombre: categoria.nombre,
      slug: categoria.slug,
      categoria_padre_id:
        categoria.categoria_padre_id ?? null
    };

    this.mostrarFormulario = true;
  }


  // ===================================================
  // CANCELAR FORMULARIO
  // ===================================================

  cancelarFormulario(): void {

    this.mostrarFormulario = false;

    this.modoEdicion = false;

    this.categoriaEditandoId = null;

    this.formulario = {
      nombre: '',
      slug: '',
      categoria_padre_id: null
    };
  }


  // ===================================================
  // CATEGORÍAS DISPONIBLES COMO PADRE
  // ===================================================

  obtenerCategoriasPadreDisponibles(): AdminCategoria[] {

    return this.categoriasPrincipales.filter(
      categoria =>
        categoria.id !== this.categoriaEditandoId
    );
  }


  // ===================================================
  // GENERAR SLUG
  // ===================================================

  generarSlug(): void {

    if (!this.formulario.nombre.trim()) {
      return;
    }

    this.formulario.slug = this.formulario.nombre
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
  // GUARDAR CATEGORÍA
  // ===================================================

  guardarCategoria(): void {

    if (this.guardando) {
      return;
    }

    this.error = '';

    this.mensajeExito = '';

    // ===============================================
    // VALIDAR NOMBRE
    // ===============================================

    if (!this.formulario.nombre.trim()) {

      this.error =
        'Ingresa el nombre de la categoría.';

      return;
    }

    if (this.formulario.nombre.trim().length > 100) {

      this.error =
        'El nombre no puede superar los 100 caracteres.';

      return;
    }

    // ===============================================
    // GENERAR SLUG SI ESTÁ VACÍO
    // ===============================================

    if (!this.formulario.slug.trim()) {
      this.generarSlug();
    }

    if (this.formulario.slug.trim().length > 100) {

      this.error =
        'El slug no puede superar los 100 caracteres.';

      return;
    }

    // ===============================================
    // VALIDAR CATEGORÍA PRINCIPAL
    // ===============================================

    const categoriaPadreId =
      this.formulario.categoria_padre_id == null ||
      this.formulario.categoria_padre_id === ('' as any)
        ? null
        : Number(this.formulario.categoria_padre_id);

    if (categoriaPadreId !== null) {

      const padreValido =
        this.obtenerCategoriasPadreDisponibles().some(
          categoria =>
            categoria.id === categoriaPadreId
        );

      if (!padreValido) {

        this.error =
          'Selecciona una categoría principal válida.';

        return;
      }
    }

    // ===============================================
    // PREPARAR DATOS
    // ===============================================

    const datos: CategoriaPayload = {
      nombre: this.formulario.nombre.trim(),
      slug: this.formulario.slug.trim(),
      categoria_padre_id: categoriaPadreId
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

            this.mensajeExito = respuesta.mensaje;

            this.cancelarFormulario();

            this.cargarCategorias();
          },

          error: (error) => {

            this.manejarErrorGuardado(error);
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

          this.mensajeExito = respuesta.mensaje;

          this.cancelarFormulario();

          this.cargarCategorias();
        },

        error: (error) => {

          this.manejarErrorGuardado(error);
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
      (total, categoria) => {

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
