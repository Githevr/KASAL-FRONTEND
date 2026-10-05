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
  AdminPedidosService,
  AdminPedido,
  EstadoPedido,
  OrigenPedido
} from '../../../services/admin-pedidos';


@Component({
  selector: 'app-admin-cotizaciones',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl:
    './admin-cotizaciones.html',

  styleUrl:
    './admin-cotizaciones.css'
})

export class AdminCotizacionesComponent
  implements OnInit {


  // =====================================================
  // DATOS
  // =====================================================

  pedidos: AdminPedido[] = [];

  pedidosFiltrados: AdminPedido[] = [];


  // =====================================================
  // ESTADOS DE LA INTERFAZ
  // =====================================================

  cargando = true;

  error = '';

  actualizandoId:
    number | null = null;


  // =====================================================
  // FILTROS
  // =====================================================

  busqueda = '';

  filtroEstado = 'todos';

  filtroOrigen = 'todos';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private adminPedidosService:
      AdminPedidosService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.cargarPedidos();

  }


  // =====================================================
  // CARGAR COTIZACIONES
  // =====================================================

  cargarPedidos(): void {

    this.cargando = true;

    this.error = '';


    this.adminPedidosService
      .obtenerPedidos()
      .subscribe({

        next: (pedidos) => {

          console.log(
            'Cotizaciones administrativas:',
            pedidos
          );


          this.pedidos =
            Array.isArray(pedidos)
              ? [...pedidos]
              : [];


          this.aplicarFiltros();


          this.cargando = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cargando cotizaciones:',
            error
          );


          this.pedidos = [];

          this.pedidosFiltrados = [];

          this.cargando = false;


          if (
            error.status === 401
          ) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          } else {

            this.error =
              'No se pudieron cargar las cotizaciones.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // FILTRAR
  // =====================================================

  aplicarFiltros(): void {

    const texto =
      this.normalizarTexto(
        this.busqueda
      );


    this.pedidosFiltrados =
      this.pedidos.filter(
        pedido => {


          // =============================================
          // BÚSQUEDA
          // =============================================

          const coincideBusqueda =

            !texto ||

            String(
              pedido.id
            ).includes(texto) ||

            this.normalizarTexto(
              pedido.nombre_cliente || ''
            ).includes(texto) ||

            this.normalizarTexto(
              pedido.empresa_cliente || ''
            ).includes(texto) ||

            this.normalizarTexto(
              pedido.ruc_cliente || ''
            ).includes(texto) ||

            this.normalizarTexto(
              pedido.telefono_cliente || ''
            ).includes(texto) ||

            this.normalizarTexto(
              pedido.email_cliente || ''
            ).includes(texto);


          // =============================================
          // ESTADO
          // =============================================

          const coincideEstado =

            this.filtroEstado ===
              'todos' ||

            pedido.estado ===
              this.filtroEstado;


          // =============================================
          // ORIGEN
          // =============================================

          const coincideOrigen =

            this.filtroOrigen ===
              'todos' ||

            pedido.origen ===
              this.filtroOrigen;


          return (

            coincideBusqueda &&

            coincideEstado &&

            coincideOrigen

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

    this.filtroOrigen =
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
  // CAMBIAR ESTADO
  // =====================================================

  cambiarEstado(

    pedido: AdminPedido,

    nuevoEstado: string

  ): void {

    if (
      !this.esEstadoValido(
        nuevoEstado
      )
    ) {

      return;

    }


    if (
      pedido.estado ===
        nuevoEstado
    ) {

      return;

    }


    const estadoAnterior =
      pedido.estado;


    this.actualizandoId =
      pedido.id;

    this.error = '';


    this.adminPedidosService
      .cambiarEstado(
        pedido.id,
        nuevoEstado
      )
      .subscribe({

        next: () => {

          pedido.estado =
            nuevoEstado;


          this.actualizandoId =
            null;


          this.aplicarFiltros();

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cambiando estado:',
            error
          );


          pedido.estado =
            estadoAnterior;


          this.actualizandoId =
            null;


          this.error =
            error.error?.mensaje ||
            'No se pudo cambiar el estado de la cotización.';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // VALIDAR ESTADO
  // =====================================================

  private esEstadoValido(
    estado: string
  ): estado is EstadoPedido {

    return [

      'nuevo',

      'en_revision',

      'cotizado',

      'confirmado',

      'cancelado'

    ].includes(
      estado
    );

  }


  // =====================================================
  // TEXTO ESTADO
  // =====================================================

  obtenerNombreEstado(
    estado: EstadoPedido
  ): string {

    const nombres:
      Record<EstadoPedido, string> = {

      nuevo:
        'Nuevo',

      en_revision:
        'En revisión',

      cotizado:
        'Cotizado',

      confirmado:
        'Confirmado',

      cancelado:
        'Cancelado'

    };


    return nombres[estado];

  }


  // =====================================================
  // TEXTO ORIGEN
  // =====================================================

  obtenerNombreOrigen(
    origen: OrigenPedido
  ): string {

    const nombres:
      Record<OrigenPedido, string> = {

      tiktok:
        'TikTok',

      facebook:
        'Facebook',

      instagram:
        'Instagram',

      directo:
        'Directo'

    };


    return nombres[origen];

  }


  // =====================================================
  // MÉTRICAS
  // =====================================================

  obtenerTotalNuevos(): number {

    return this.pedidos.filter(
      pedido =>
        pedido.estado ===
          'nuevo'
    ).length;

  }


  obtenerTotalRevision(): number {

    return this.pedidos.filter(
      pedido =>
        pedido.estado ===
          'en_revision'
    ).length;

  }


  obtenerTotalCotizados(): number {

    return this.pedidos.filter(
      pedido =>
        pedido.estado ===
          'cotizado'
    ).length;

  }


  obtenerTotalConfirmados(): number {

    return this.pedidos.filter(
      pedido =>
        pedido.estado ===
          'confirmado'
    ).length;

  }


  obtenerMontoTotal(): number {

    return this.pedidos.reduce(
      (
        total,
        pedido
      ) => {

        return (
          total +
          Number(
            pedido.total || 0
          )
        );

      },
      0
    );

  }

}