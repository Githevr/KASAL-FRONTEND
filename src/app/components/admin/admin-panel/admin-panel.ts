import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AdminAuthService
} from '../../../services/admin-auth';

import {
  AdminPedidosService,
  AdminPedido,
  EstadoPedido
} from '../../../services/admin-pedidos';


@Component({
  selector: 'app-admin-panel',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl:
    './admin-panel.html',

  styleUrl:
    './admin-panel.css'
})
export class AdminPanelComponent
  implements OnInit {

  // =====================================================
  // ESTADO
  // =====================================================

  cargando = true;

  error = '';


  // =====================================================
  // COTIZACIONES
  // =====================================================

  pedidos: AdminPedido[] = [];

  ultimasCotizaciones:
    AdminPedido[] = [];


  // =====================================================
  // MÉTRICAS
  // =====================================================

  totalCotizaciones = 0;

  totalNuevas = 0;

  totalRevision = 0;

  totalCotizadas = 0;

  totalConfirmadas = 0;

  totalCanceladas = 0;

  montoTotal = 0;

  montoConfirmado = 0;


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

    this.cargarDashboard();

  }


  // =====================================================
  // CARGAR DASHBOARD
  // =====================================================

  cargarDashboard(): void {

    this.cargando = true;

    this.error = '';


    this.adminPedidosService
      .obtenerPedidos()
      .subscribe({

        next: (
          pedidos: AdminPedido[]
        ) => {

          this.pedidos =
            Array.isArray(pedidos)
              ? pedidos
              : [];


          this.calcularMetricas();


          // =================================================
          // ÚLTIMAS 5 COTIZACIONES
          // =================================================

          this.ultimasCotizaciones =
            this.pedidos
              .slice(0, 5);


          this.cargando = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cargando dashboard:',
            error
          );


          this.pedidos = [];

          this.ultimasCotizaciones = [];


          this.cargando = false;


          if (
            error.status === 401
          ) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          } else {

            this.error =
              error.error?.mensaje ||
              'No se pudo cargar la información del dashboard.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // CALCULAR MÉTRICAS
  // =====================================================

  private calcularMetricas(): void {

    this.totalCotizaciones =
      this.pedidos.length;


    // =====================================================
    // NUEVAS
    // =====================================================

    this.totalNuevas =
      this.pedidos.filter(
        pedido =>
          pedido.estado ===
          'nuevo'
      ).length;


    // =====================================================
    // EN REVISIÓN
    // =====================================================

    this.totalRevision =
      this.pedidos.filter(
        pedido =>
          pedido.estado ===
          'en_revision'
      ).length;


    // =====================================================
    // COTIZADAS
    // =====================================================

    this.totalCotizadas =
      this.pedidos.filter(
        pedido =>
          pedido.estado ===
          'cotizado'
      ).length;


    // =====================================================
    // CONFIRMADAS
    // =====================================================

    this.totalConfirmadas =
      this.pedidos.filter(
        pedido =>
          pedido.estado ===
          'confirmado'
      ).length;


    // =====================================================
    // CANCELADAS
    // =====================================================

    this.totalCanceladas =
      this.pedidos.filter(
        pedido =>
          pedido.estado ===
          'cancelado'
      ).length;


    // =====================================================
    // MONTO TOTAL
    // =====================================================

    this.montoTotal =
      this.pedidos.reduce(
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


    // =====================================================
    // MONTO CONFIRMADO
    // =====================================================

    this.montoConfirmado =
      this.pedidos

        .filter(
          pedido =>
            pedido.estado ===
            'confirmado'
        )

        .reduce(
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


  // =====================================================
  // NOMBRE ESTADO
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
  // CLASE CSS ESTADO
  // =====================================================

  obtenerClaseEstado(
    estado: EstadoPedido
  ): string {

    const clases:
      Record<EstadoPedido, string> = {

        nuevo:
          'nuevo',

        en_revision:
          'revision',

        cotizado:
          'cotizado',

        confirmado:
          'confirmado',

        cancelado:
          'cancelado'

      };


    return clases[estado];

  }

}