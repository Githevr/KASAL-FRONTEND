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
  AdminSectoresService,
  AdminSector,
  SectorPayload
} from '../../../services/admin-sectores';


@Component({
  selector: 'app-admin-sectores',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './admin-sectores.html',

  styleUrl:
    './admin-sectores.css'
})
export class AdminSectoresComponent
  implements OnInit {


  // =====================================================
  // SECTORES
  // =====================================================

  sectores: AdminSector[] = [];

  sectoresFiltrados: AdminSector[] = [];


  // =====================================================
  // ESTADOS GENERALES
  // =====================================================

  cargando = true;

  guardando = false;

  cambiandoEstadoId:
    number | null = null;

  error = '';

  mensajeExito = '';


  // =====================================================
  // FILTROS
  // =====================================================

  busqueda = '';

  filtroEstado:
    'todos' |
    'activos' |
    'inactivos' = 'todos';


  // =====================================================
  // FORMULARIO
  // =====================================================

  mostrarFormulario = false;

  modoEdicion = false;

  sectorEditandoId:
    number | null = null;


  formulario: SectorPayload = {

    nombre: '',

    slug: '',

    activo: 1

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private adminSectoresService:
      AdminSectoresService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.cargarSectores();

  }


  // =====================================================
  // CARGAR SECTORES
  // =====================================================

  cargarSectores(): void {

    this.cargando = true;

    this.error = '';


    this.adminSectoresService
      .obtenerSectores()
      .subscribe({

        next: (sectores) => {

          console.log(
            'Sectores administrativos:',
            sectores
          );


          this.sectores =
            Array.isArray(sectores)
              ? sectores
              : [];


          this.aplicarFiltros();


          this.cargando = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cargando sectores:',
            error
          );


          this.sectores = [];

          this.sectoresFiltrados = [];

          this.cargando = false;


          if (
            error.status === 401
          ) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          } else {

            this.error =
              error.error?.mensaje ||
              'No se pudieron cargar los sectores.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // APLICAR FILTROS
  // =====================================================

  aplicarFiltros(): void {

    const texto =
      this.normalizarTexto(
        this.busqueda
      );


    this.sectoresFiltrados =
      this.sectores.filter(
        sector => {

          // =============================================
          // BÚSQUEDA
          // =============================================

          const coincideBusqueda =

            !texto ||

            this.normalizarTexto(
              sector.nombre || ''
            ).includes(texto)

            ||

            this.normalizarTexto(
              sector.slug || ''
            ).includes(texto)

            ||

            String(
              sector.id
            ).includes(texto);


          // =============================================
          // ESTADO
          // =============================================

          let coincideEstado = true;


          if (
            this.filtroEstado ===
            'activos'
          ) {

            coincideEstado =
              Number(
                sector.activo
              ) === 1;

          }


          if (
            this.filtroEstado ===
            'inactivos'
          ) {

            coincideEstado =
              Number(
                sector.activo
              ) === 0;

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

    return String(
      texto || ''
    )

      .trim()

      .toLowerCase()

      .normalize('NFD')

      .replace(
        /[\u0300-\u036f]/g,
        ''
      );

  }


  // =====================================================
  // NUEVO SECTOR
  // =====================================================

  nuevoSector(): void {

    this.error = '';

    this.mensajeExito = '';

    this.modoEdicion = false;

    this.sectorEditandoId =
      null;


    this.formulario = {

      nombre: '',

      slug: '',

      activo: 1

    };


    this.mostrarFormulario =
      true;

  }


  // =====================================================
  // EDITAR SECTOR
  // =====================================================

  editarSector(
    sector: AdminSector
  ): void {

    this.error = '';

    this.mensajeExito = '';

    this.modoEdicion = true;

    this.sectorEditandoId =
      sector.id;


    this.formulario = {

      nombre:
        sector.nombre,

      slug:
        sector.slug,

      activo:
        Number(
          sector.activo
        ) === 1
          ? 1
          : 0

    };


    this.mostrarFormulario =
      true;

  }


  // =====================================================
  // CANCELAR FORMULARIO
  // =====================================================

  cancelarFormulario(): void {

    if (
      this.guardando
    ) {

      return;

    }


    this.mostrarFormulario =
      false;

    this.modoEdicion =
      false;

    this.sectorEditandoId =
      null;


    this.formulario = {

      nombre: '',

      slug: '',

      activo: 1

    };

  }


  // =====================================================
  // GENERAR SLUG
  // =====================================================

  generarSlug(): void {

    const nombre =
      this.formulario.nombre
        .trim();


    if (!nombre) {

      this.formulario.slug = '';

      return;

    }


    this.formulario.slug =

      nombre

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
  // ACTIVO PARA CHECKBOX / SWITCH
  // =====================================================

  get sectorActivo(): boolean {

    return Number(
      this.formulario.activo
    ) === 1;

  }


  set sectorActivo(
    valor: boolean
  ) {

    this.formulario.activo =
      valor
        ? 1
        : 0;

  }


  // =====================================================
  // GUARDAR SECTOR
  // =====================================================

  guardarSector(): void {

    this.error = '';

    this.mensajeExito = '';


    // ===================================================
    // NOMBRE
    // ===================================================

    const nombre =
      this.formulario.nombre
        .trim();


    if (!nombre) {

      this.error =
        'Ingresa el nombre del sector.';

      return;

    }


    // ===================================================
    // SLUG
    // ===================================================

    if (
      !this.formulario.slug.trim()
    ) {

      this.generarSlug();

    }


    const slug =
      this.formulario.slug
        .trim();


    if (!slug) {

      this.error =
        'No se pudo generar el slug del sector.';

      return;

    }


    // ===================================================
    // DATOS NORMALIZADOS
    // ===================================================

    const datos:
      SectorPayload = {

      nombre,

      slug,

      activo:
        Number(
          this.formulario.activo
        ) === 1
          ? 1
          : 0

    };


    this.guardando = true;


    // ===================================================
    // EDITAR
    // ===================================================

    if (
      this.modoEdicion &&
      this.sectorEditandoId !== null
    ) {

      this.adminSectoresService
        .actualizarSector(
          this.sectorEditandoId,
          datos
        )
        .subscribe({

          next: (respuesta) => {

            console.log(
              'Sector actualizado:',
              respuesta
            );


            this.guardando =
              false;


            this.mensajeExito =
              respuesta.mensaje ||
              'Sector actualizado correctamente.';


            this.cerrarFormulario();


            this.cargarSectores();

          },


          error: (error) => {

            this.manejarErrorGuardado(
              error
            );

          }

        });


      return;

    }


    // ===================================================
    // CREAR
    // ===================================================

    this.adminSectoresService
      .crearSector(
        datos
      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Sector creado:',
            respuesta
          );


          this.guardando =
            false;


          this.mensajeExito =
            respuesta.mensaje ||
            'Sector creado correctamente.';


          this.cerrarFormulario();


          this.cargarSectores();

        },


        error: (error) => {

          this.manejarErrorGuardado(
            error
          );

        }

      });

  }


  // =====================================================
  // CERRAR FORMULARIO INTERNAMENTE
  // =====================================================

  private cerrarFormulario(): void {

    this.mostrarFormulario =
      false;

    this.modoEdicion =
      false;

    this.sectorEditandoId =
      null;


    this.formulario = {

      nombre: '',

      slug: '',

      activo: 1

    };

  }


  // =====================================================
  // MANEJAR ERROR AL GUARDAR
  // =====================================================

  private manejarErrorGuardado(
    error: any
  ): void {

    console.error(
      'Error guardando sector:',
      error
    );


    this.guardando =
      false;


    if (
      error.status === 401
    ) {

      this.error =
        'Tu sesión ha expirado. Inicia sesión nuevamente.';

    } else if (
      error.status === 409
    ) {

      this.error =
        error.error?.mensaje ||
        'Ya existe un sector con ese slug.';

    } else {

      this.error =
        error.error?.mensaje ||
        'No se pudo guardar el sector.';

    }


    this.cdr.detectChanges();

  }


  // =====================================================
  // ACTIVAR / DESACTIVAR
  // =====================================================

  cambiarEstado(
    sector: AdminSector
  ): void {

    if (
      this.cambiandoEstadoId !== null
    ) {

      return;

    }


    this.error = '';

    this.mensajeExito = '';


    const nuevoEstado =
      Number(
        sector.activo
      ) !== 1;


    this.cambiandoEstadoId =
      sector.id;


    this.adminSectoresService
      .cambiarEstado(
        sector.id,
        nuevoEstado
      )
      .subscribe({

        next: (respuesta) => {

          sector.activo =
            Number(
              respuesta.activo
            ) === 1
              ? 1
              : 0;


          this.cambiandoEstadoId =
            null;


          this.mensajeExito =
            respuesta.mensaje;


          this.aplicarFiltros();

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cambiando estado del sector:',
            error
          );


          this.cambiandoEstadoId =
            null;


          if (
            error.status === 401
          ) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          } else {

            this.error =
              error.error?.mensaje ||
              'No se pudo cambiar el estado del sector.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // ¿ESTÁ CAMBIANDO ESTE SECTOR?
  // =====================================================

  estaCambiandoEstado(
    sectorId: number
  ): boolean {

    return (
      this.cambiandoEstadoId ===
      sectorId
    );

  }


  // =====================================================
  // TOTAL DE SECTORES
  // =====================================================

  obtenerTotalSectores(): number {

    return this.sectores.length;

  }


  // =====================================================
  // SECTORES ACTIVOS
  // =====================================================

  obtenerSectoresActivos(): number {

    return this.sectores.filter(
      sector =>
        Number(
          sector.activo
        ) === 1
    ).length;

  }


  // =====================================================
  // SECTORES INACTIVOS
  // =====================================================

  obtenerSectoresInactivos(): number {

    return this.sectores.filter(
      sector =>
        Number(
          sector.activo
        ) === 0
    ).length;

  }


  // =====================================================
  // SECTORES CON PRODUCTOS
  // =====================================================

  obtenerSectoresConProductos(): number {

    return this.sectores.filter(
      sector =>
        Number(
          sector.total_productos || 0
        ) > 0
    ).length;

  }


  // =====================================================
  // TOTAL DE ASIGNACIONES PRODUCTO-SECTOR
  // =====================================================

  obtenerTotalProductosAsignados():
    number {

    return this.sectores.reduce(
      (
        total,
        sector
      ) => {

        return (
          total +
          Number(
            sector.total_productos || 0
          )
        );

      },
      0
    );

  }


  // =====================================================
  // TEXTO DEL ESTADO
  // =====================================================

  obtenerTextoEstado(
    sector: AdminSector
  ): string {

    return (
      Number(
        sector.activo
      ) === 1
        ? 'Activo'
        : 'Inactivo'
    );

  }

}