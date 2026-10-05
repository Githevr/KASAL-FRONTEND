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
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Subscription
} from 'rxjs';

import {
  CarritoService
} from '../../services/carrito';

import {
  CotizacionService,
  NuevaCotizacion,
  CrearCotizacionResponse
} from '../../services/cotizacion';

import {
  ItemCarrito
} from '../../models/producto';

// =====================================================
// FORMULARIO
// =====================================================

interface FormularioCotizacion {

  nombre_cliente: string;

  empresa_cliente: string;

  ruc_cliente: string;

  telefono_cliente: string;

  email_cliente: string;

  mensaje_cliente: string;

}


// =====================================================
// COMPONENTE
// =====================================================

@Component({
  selector: 'app-cotizacion',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl:
    './cotizacion.html',

  styleUrl:
    './cotizacion.css'
})
export class CotizacionComponent
  implements OnInit, OnDestroy {


  // =====================================================
  // CARRITO
  // =====================================================

  items: ItemCarrito[] = [];


  // =====================================================
  // FORMULARIO
  // =====================================================

  formulario:
    FormularioCotizacion = {

      nombre_cliente: '',

      empresa_cliente: '',

      ruc_cliente: '',

      telefono_cliente: '',

      email_cliente: '',

      mensaje_cliente: ''

    };


  // =====================================================
  // ESTADOS
  // =====================================================

  enviando = false;

  enviado = false;

  error = '';


  // =====================================================
  // RESPUESTA COTIZACIÓN
  // =====================================================

  pedidoId:
    number | null =
      null;


  totalConfirmado =
    0;


  // =====================================================
  // SUSCRIPCIÓN CARRITO
  // =====================================================

  private carritoSubscription?:
    Subscription;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private carritoService:
      CarritoService,

    private cotizacionService:
      CotizacionService,

    private cdr:
      ChangeDetectorRef

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.carritoSubscription =
      this.carritoService
        .carrito$
        .subscribe(
          items => {

            this.items =
              items.map(
                item => ({
                  ...item
                })
              );


            this.cdr.detectChanges();

          }
        );

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.carritoSubscription
      ?.unsubscribe();

  }


  // =====================================================
  // OBTENER IMAGEN
  // =====================================================

  obtenerImagen(
    imagenUrl:
      string | null | undefined
  ): string {

    if (!imagenUrl) {

      return '';

    }


    // ===================================================
    // SI YA VIENE URL COMPLETA
    // ===================================================

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


    // ===================================================
    // ARCHIVOS DEL BACKEND
    // ===================================================

    if (
      imagenUrl.startsWith(
        '/uploads/'
      )
    ) {

      return (
        `http://localhost:3000${imagenUrl}`
      );

    }


    // ===================================================
    // SI VIENE uploads/... SIN /
    // ===================================================

    if (
      imagenUrl.startsWith(
        'uploads/'
      )
    ) {

      return (
        `http://localhost:3000/${imagenUrl}`
      );

    }


    // ===================================================
    // OTRA RUTA
    // ===================================================

    return imagenUrl;

  }


  // =====================================================
  // ERROR IMAGEN
  // =====================================================

  imagenError(
    event: Event
  ): void {

    const imagen =
      event.target as
        HTMLImageElement;


    imagen.style.display =
      'none';

  }


  // =====================================================
  // SUBTOTAL
  // =====================================================

  obtenerSubtotal(
    item: ItemCarrito
  ): number {

    return (
      Number(item.precio) *
      Number(item.cantidad)
    );

  }


  // =====================================================
  // TOTAL
  // =====================================================

  obtenerTotal():
    number {

    return this.carritoService
      .obtenerTotal();

  }


  // =====================================================
  // CANTIDAD TOTAL
  // =====================================================

  obtenerCantidadTotal():
    number {

    return this.carritoService
      .obtenerCantidadTotal();

  }


  // =====================================================
  // AUMENTAR CANTIDAD
  // =====================================================

  aumentarCantidad(
    item: ItemCarrito
  ): void {

    if (
      this.enviando
    ) {

      return;

    }


    const cantidad =
      Number(
        item.cantidad
      );


    const stock =
      Number(
        item.stock
      );


    if (
      cantidad >= stock
    ) {

      return;

    }


    this.carritoService
      .aumentarCantidad(
        item.variacion_id
      );

  }


  // =====================================================
  // DISMINUIR CANTIDAD
  // =====================================================

  disminuirCantidad(
    item: ItemCarrito
  ): void {

    if (
      this.enviando
    ) {

      return;

    }


    if (
      Number(item.cantidad) <= 1
    ) {

      return;

    }


    this.carritoService
      .disminuirCantidad(
        item.variacion_id
      );

  }


  // =====================================================
  // CAMBIAR CANTIDAD MANUALMENTE
  // =====================================================

  cambiarCantidad(
    item: ItemCarrito,
    cantidad:
      number | string
  ): void {

    if (
      this.enviando
    ) {

      return;

    }


    let nuevaCantidad =
      Math.floor(
        Number(cantidad)
      );


    if (
      Number.isNaN(
        nuevaCantidad
      ) ||
      nuevaCantidad < 1
    ) {

      nuevaCantidad = 1;

    }


    const stock =
      Number(
        item.stock
      );


    if (
      !Number.isNaN(stock) &&
      stock > 0
    ) {

      nuevaCantidad =
        Math.min(
          nuevaCantidad,
          stock
        );

    }


    this.carritoService
      .cambiarCantidad(
        item.variacion_id,
        nuevaCantidad
      );

  }


  // =====================================================
  // ELIMINAR PRODUCTO
  // =====================================================

  eliminarProducto(
    item: ItemCarrito
  ): void {

    if (
      this.enviando
    ) {

      return;

    }


    this.carritoService
      .eliminarDelCarrito(
        item.variacion_id
      );

  }


  // =====================================================
  // VALIDAR FORMULARIO
  // =====================================================

  private validarFormulario():
    boolean {

    this.error = '';


    // ===================================================
    // PRODUCTOS
    // ===================================================

    if (
      this.items.length === 0
    ) {

      this.error =
        'Agrega al menos un producto antes de solicitar una cotización.';

      return false;

    }


    // ===================================================
    // NOMBRE
    // ===================================================

    if (
      !this.formulario
        .nombre_cliente
        .trim()
    ) {

      this.error =
        'Ingresa tu nombre o el nombre de la persona de contacto.';

      return false;

    }


    // ===================================================
    // TELÉFONO
    // ===================================================

    if (
      !this.formulario
        .telefono_cliente
        .trim()
    ) {

      this.error =
        'Ingresa un número de teléfono.';

      return false;

    }


    // ===================================================
    // TELÉFONO - VALIDACIÓN BÁSICA
    // ===================================================

    const telefono =
      this.formulario
        .telefono_cliente
        .replace(
          /\s+/g,
          ''
        );


    if (
      telefono.length < 7
    ) {

      this.error =
        'Ingresa un número de teléfono válido.';

      return false;

    }


    // ===================================================
    // RUC
    // ===================================================

    const ruc =
      this.formulario
        .ruc_cliente
        .trim();


    if (
      ruc &&
      !/^\d{11}$/.test(ruc)
    ) {

      this.error =
        'El RUC debe contener exactamente 11 dígitos.';

      return false;

    }


    // ===================================================
    // EMAIL
    // ===================================================

    const email =
      this.formulario
        .email_cliente
        .trim();


    if (
      email &&
      !this.emailValido(
        email
      )
    ) {

      this.error =
        'Ingresa un correo electrónico válido.';

      return false;

    }


    // ===================================================
    // ITEMS
    // ===================================================

    const itemInvalido =
      this.items.some(
        item => {

          const variacionId =
            Number(
              item.variacion_id
            );


          const cantidad =
            Number(
              item.cantidad
            );


          return (
            !variacionId ||
            cantidad <= 0 ||
            Number.isNaN(
              cantidad
            )
          );

        }
      );


    if (
      itemInvalido
    ) {

      this.error =
        'Hay un producto con una cantidad inválida.';

      return false;

    }


    return true;

  }


  // =====================================================
  // VALIDAR EMAIL
  // =====================================================

  private emailValido(
    email: string
  ): boolean {

    return (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
          email
        )
    );

  }


  // =====================================================
  // ENVIAR COTIZACIÓN
  // =====================================================

  enviarCotizacion():
    void {

    // ===================================================
    // EVITAR DOBLE ENVÍO
    // ===================================================

    if (
      this.enviando
    ) {

      return;

    }


    // ===================================================
    // VALIDAR
    // ===================================================

    if (
      !this.validarFormulario()
    ) {

      this.cdr.detectChanges();

      return;

    }


    // ===================================================
    // NORMALIZAR DATOS
    // ===================================================

    const nombreCliente =
      this.formulario
        .nombre_cliente
        .trim();


    const empresaCliente =
      this.formulario
        .empresa_cliente
        .trim();


    const rucCliente =
      this.formulario
        .ruc_cliente
        .trim();


    const telefonoCliente =
      this.formulario
        .telefono_cliente
        .trim();


    const emailCliente =
      this.formulario
        .email_cliente
        .trim();


    const mensajeCliente =
      this.formulario
        .mensaje_cliente
        .trim();


    // ===================================================
    // PAYLOAD
    //
    // IMPORTANTE:
    // NO enviamos precio ni total como fuente confiable.
    //
    // El backend debe consultar MySQL y recalcular todo.
    // ===================================================

    const solicitud: NuevaCotizacion = {

  nombre_cliente:
    this.formulario
      .nombre_cliente
      .trim(),

  empresa_cliente:
    this.formulario
      .empresa_cliente
      .trim() || null,

  ruc_cliente:
    this.formulario
      .ruc_cliente
      .trim() || null,

  telefono_cliente:
    this.formulario
      .telefono_cliente
      .trim(),

  email_cliente:
    this.formulario
      .email_cliente
      .trim() || null,

  mensaje_cliente:
    this.formulario
      .mensaje_cliente
      .trim() || null,

  origen:
    'directo',

  productos:
    this.items.map(
      item => ({

        variacion_id:
          Number(
            item.variacion_id
          ),

        cantidad:
          Number(
            item.cantidad
          )

      })
    )

};

    // ===================================================
    // ESTADO
    // ===================================================

    this.enviando = true;

    this.error = '';


    // ===================================================
    // ENVIAR
    // ===================================================

    console.log(
  'SOLICITUD QUE SE ENVIARÁ:',
  solicitud
);
    
    this.cotizacionService
      .crearCotizacion(
        solicitud
      )
      .subscribe({

        // =================================================
        // ÉXITO
        // =================================================

        next: (
  respuesta: CrearCotizacionResponse
) => {

  console.log(
    'Cotización creada:',
    respuesta
  );


  this.enviando = false;


  this.pedidoId =
    Number(
      respuesta.pedido_id
    );


  this.totalConfirmado =
    Number(
      respuesta.total
    ) || 0;


  this.enviado = true;


  this.carritoService
    .vaciarCarrito();


  this.cdr.detectChanges();


  window.scrollTo({

    top: 0,

    behavior: 'smooth'

  });

},


        // =================================================
        // ERROR
        // =================================================

        error: (
            error: HttpErrorResponse
            ) => {

            console.error(
                'Error creando cotización:',
                error
            );


            this.enviando = false;


            if (
                error.error?.mensaje
            ) {

                this.error =
                error.error.mensaje;

            } else if (
                error.status === 0
            ) {

                this.error =
                'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';

            } else if (
                error.status === 400
            ) {

                this.error =
                'Revisa los datos ingresados y vuelve a intentarlo.';

            } else if (
                error.status === 404
            ) {

                this.error =
                'No se encontró el servicio de cotizaciones.';

            } else if (
                error.status === 500
            ) {

                this.error =
                'Ocurrió un error en el servidor al procesar la cotización.';

            } else {

                this.error =
                'No se pudo enviar la solicitud de cotización. Inténtalo nuevamente.';

            }


            this.cdr.detectChanges();

            }

      });

  }

}