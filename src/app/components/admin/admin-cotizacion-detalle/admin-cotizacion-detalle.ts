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
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  AdminPedidosService,
  AdminPedidoCompleto,
  EstadoPedido,
  OrigenPedido
} from '../../../services/admin-pedidos';

import {
  environment
} from '../../../../environments/environment';

@Component({
  selector: 'app-admin-cotizacion-detalle',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
  ],

  templateUrl:
    './admin-cotizacion-detalle.html',

  styleUrl:
    './admin-cotizacion-detalle.css'
})
export class AdminCotizacionDetalleComponent
  implements OnInit {


  // =====================================================
  // COTIZACIÓN
  // =====================================================

  pedido: AdminPedidoCompleto | null = null;


  // =====================================================
  // ESTADOS DE INTERFAZ
  // =====================================================

  cargando = true;

  error = '';

  actualizandoEstado = false;


  // =====================================================
  // ID
  // =====================================================

  pedidoId: number | null = null;


  // =====================================================
  // URL BACKEND
  // =====================================================

private readonly backendUrl =
  environment.apiUrl.replace(
    /\/api\/?$/,
    ''
  );


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private adminPedidosService:
      AdminPedidosService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    if (
      !id ||
      Number.isNaN(id)
    ) {

      this.error =
        'El identificador de la cotización no es válido.';

      this.cargando = false;

      return;

    }


    this.pedidoId = id;

    this.cargarPedido();

  }


  // =====================================================
  // CARGAR COTIZACIÓN
  // =====================================================

  cargarPedido(): void {

    if (!this.pedidoId) {
      return;
    }


    this.cargando = true;

    this.error = '';


    this.adminPedidosService
      .obtenerPedidoPorId(
        this.pedidoId
      )
      .subscribe({

        next: (pedido) => {

          console.log(
            'Detalle de cotización:',
            pedido
          );


          this.pedido = pedido;

          this.cargando = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cargando cotización:',
            error
          );


          this.pedido = null;

          this.cargando = false;


          if (
            error.status === 401
          ) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          } else if (
            error.status === 404
          ) {

            this.error =
              'La cotización solicitada no existe.';

          } else {

            this.error =
              error.error?.mensaje ||
              'No se pudo cargar la cotización.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  cambiarEstado(
    nuevoEstado: string
  ): void {

    if (!this.pedido) {
      return;
    }


    if (
      !this.esEstadoValido(
        nuevoEstado
      )
    ) {

      return;

    }


    if (
      this.pedido.estado ===
      nuevoEstado
    ) {

      return;

    }


    const estadoAnterior =
      this.pedido.estado;


    this.actualizandoEstado = true;

    this.error = '';


    this.adminPedidosService
      .cambiarEstado(
        this.pedido.id,
        nuevoEstado
      )
      .subscribe({

        next: () => {

          if (this.pedido) {

            this.pedido.estado =
              nuevoEstado;

          }


          this.actualizandoEstado =
            false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cambiando estado:',
            error
          );


          if (this.pedido) {

            this.pedido.estado =
              estadoAnterior;

          }


          this.actualizandoEstado =
            false;


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
  // NOMBRE DEL ESTADO
  // =====================================================

  obtenerNombreEstado(
    estado: EstadoPedido
  ): string {

    const estados:
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


    return estados[estado];

  }


  // =====================================================
  // NOMBRE DEL ORIGEN
  // =====================================================

  obtenerNombreOrigen(
    origen: OrigenPedido
  ): string {

    const origenes:
      Record<OrigenPedido, string> = {

        directo:
          'Directo',

        instagram:
          'Instagram',

        facebook:
          'Facebook',

        tiktok:
          'TikTok'

      };


    return origenes[origen];

  }


  // =====================================================
  // SUBTOTAL DETALLE
  // =====================================================

  obtenerSubtotal(
    cantidad: number,
    precio: number
  ): number {

    return (
      Number(cantidad) *
      Number(precio)
    );

  }


  // =====================================================
  // TOTAL DE UNIDADES
  // =====================================================

  obtenerTotalUnidades(): number {

    if (
      !this.pedido?.detalles
    ) {

      return 0;

    }


    return this.pedido.detalles.reduce(
      (
        total,
        detalle
      ) => {

        return (
          total +
          Number(
            detalle.cantidad || 0
          )
        );

      },
      0
    );

  }


  // =====================================================
  // TOTAL DE ITEMS
  // =====================================================

  obtenerTotalItems(): number {

    return (
      this.pedido?.detalles?.length ||
      0
    );

  }

    // =====================================================
  // WHATSAPP
  // =====================================================

  abrirWhatsApp(): void {

    if (!this.pedido) {
      return;
    }


    const telefono =
      this.normalizarTelefonoWhatsApp(
        this.pedido.telefono_cliente
      );


    if (!telefono) {

      alert(
        'Esta cotización no tiene un número de teléfono válido.'
      );

      return;

    }


    const mensaje =
      this.generarMensajeWhatsApp();


    const url =
      `https://wa.me/${telefono}` +
      `?text=${encodeURIComponent(mensaje)}`;


    window.open(
      url,
      '_blank'
    );

  }


  // =====================================================
  // GENERAR MENSAJE DE WHATSAPP
  // =====================================================

  private generarMensajeWhatsApp(): string {

    if (!this.pedido) {
      return '';
    }


    const pedido =
      this.pedido;


    let mensaje =
      `Hola ${pedido.nombre_cliente || 'cliente'} \n\n`;


    mensaje +=
      `Te contactamos de KASAL INVERSIONES SAC respecto a tu cotización #${pedido.id}.\n\n`;


    // ===================================================
    // EMPRESA
    // ===================================================

    if (pedido.empresa_cliente) {

      mensaje +=
        `Empresa: ${pedido.empresa_cliente}\n`;

    }


    // ===================================================
    // RUC
    // ===================================================

    if (pedido.ruc_cliente) {

      mensaje +=
        `RUC: ${pedido.ruc_cliente}\n`;

    }


    if (
      pedido.empresa_cliente ||
      pedido.ruc_cliente
    ) {

      mensaje += '\n';

    }


    // ===================================================
    // DETALLE
    // ===================================================

    mensaje +=
      'Detalle de la cotización:\n\n';


    pedido.detalles.forEach(
      detalle => {

        const cantidad =
          Number(
            detalle.cantidad
          );


        const precio =
          Number(
            detalle.precio_unitario
          );


        const subtotal =
          cantidad *
          precio;


        mensaje +=
          `• ${detalle.producto_nombre}\n`;

        mensaje +=
          `  Talla: ${detalle.talla}\n`;

        mensaje +=
          `  Cantidad: ${cantidad}\n`;

        mensaje +=
          `  Precio unitario: S/ ${precio.toFixed(2)}\n`;

        mensaje +=
          `  Subtotal: S/ ${subtotal.toFixed(2)}\n\n`;

      }
    );


    // ===================================================
    // TOTAL
    // ===================================================

    mensaje +=
      `Total cotizado: S/ ${Number(
        pedido.total
      ).toFixed(2)}\n\n`;


    mensaje +=
      'Quedamos atentos para coordinar la confirmación de tu pedido.';


    return mensaje;

  }


  // =====================================================
  // NORMALIZAR TELÉFONO PARA WHATSAPP
  // =====================================================

  private normalizarTelefonoWhatsApp(
    telefono:
      string | null | undefined
  ): string {

    if (!telefono) {
      return '';
    }


    // Eliminar espacios, guiones,
    // paréntesis, "+" y otros caracteres.

    let numero =
      telefono.replace(
        /\D/g,
        ''
      );


    if (!numero) {
      return '';
    }


    // ===================================================
    // CELULAR PERUANO
    //
    // 987654321
    // se convierte en
    // 51987654321
    // ===================================================

    if (
      numero.length === 9 &&
      numero.startsWith('9')
    ) {

      numero =
        `51${numero}`;

    }


    return numero;

  }


  // =====================================================
  // URL IMAGEN
  // =====================================================

  obtenerImagen(
    imagenUrl:
      string | null | undefined
  ): string {

    if (!imagenUrl) {

      return '';

    }


    // URL completa
    if (
      imagenUrl.startsWith(
        'http://'
      ) ||
      imagenUrl.startsWith(
        'https://'
      )
    ) {

      return imagenUrl;

    }


    // /uploads/...
    if (
      imagenUrl.startsWith('/')
    ) {

      return (
        this.backendUrl +
        imagenUrl
      );

    }


    // uploads/...
    return (
      this.backendUrl +
      '/' +
      imagenUrl
    );

  }


  // =====================================================
  // ERROR DE IMAGEN
  // =====================================================

  imagenError(
    event: Event
  ): void {

    const imagen =
      event.target as HTMLImageElement;


    imagen.style.display =
      'none';

  }


  // =====================================================
  // VOLVER
  // =====================================================

  volver(): void {

    this.router.navigate([
      '/admin/cotizaciones'
    ]);

  }

}