import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject
} from 'rxjs';

import {
  ItemCarrito
} from '../models/producto';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {


  // =====================================================
  // STORAGE
  // =====================================================

  private readonly storageKey =
    'kasal_carrito_cotizacion';


  // =====================================================
  // ITEMS
  // =====================================================

  private items:
    ItemCarrito[] =
      this.cargarDesdeStorage();


  // =====================================================
  // SUBJECT
  // =====================================================

  private carritoSubject =
    new BehaviorSubject<ItemCarrito[]>(
      [...this.items]
    );


  // =====================================================
  // OBSERVABLE
  // =====================================================

  carrito$ =
    this.carritoSubject.asObservable();


  // =====================================================
  // AGREGAR AL CARRITO
  // =====================================================

  agregarAlCarrito(
    item: ItemCarrito
  ): void {

    // ===================================================
    // VALIDAR STOCK
    // ===================================================

    const stock =
      Number(item.stock);


    if (
      Number.isNaN(stock) ||
      stock <= 0
    ) {

      return;

    }


    // ===================================================
    // NORMALIZAR CANTIDAD
    // ===================================================

    let cantidad =
      Math.floor(
        Number(item.cantidad)
      );


    if (
      Number.isNaN(cantidad) ||
      cantidad < 1
    ) {

      cantidad = 1;

    }


    // No permitir superar stock

    cantidad =
      Math.min(
        cantidad,
        stock
      );


    // ===================================================
    // BUSCAR VARIACIÓN EXISTENTE
    // ===================================================

    const existe =
      this.items.find(
        producto =>
          producto.variacion_id ===
          item.variacion_id
      );


    // ===================================================
    // SI YA EXISTE
    // ===================================================

    if (existe) {

      const stockExistente =
        Number(
          existe.stock
        );


      const nuevaCantidad =
        Number(
          existe.cantidad
        ) +
        cantidad;


      // ===============================================
      // RESPETAR STOCK
      // ===============================================

      if (
        !Number.isNaN(
          stockExistente
        )
      ) {

        existe.cantidad =
          Math.min(
            nuevaCantidad,
            Math.max(
              stockExistente,
              0
            )
          );

      } else {

        existe.cantidad =
          nuevaCantidad;

      }


      this.actualizarCarrito();

      return;

    }


    // ===================================================
    // AGREGAR NUEVO ITEM
    // ===================================================

    this.items.push({

      ...item,

      precio:
        Number(item.precio),

      stock,

      cantidad

    });


    this.actualizarCarrito();

  }


  // =====================================================
  // ELIMINAR DEL CARRITO
  // =====================================================

  eliminarDelCarrito(
    variacion_id: number
  ): void {

    this.items =
      this.items.filter(
        item =>
          item.variacion_id !==
          variacion_id
      );


    this.actualizarCarrito();

  }


  // =====================================================
  // CAMBIAR CANTIDAD
  // =====================================================

  cambiarCantidad(
    variacion_id: number,
    cantidad: number
  ): void {

    const item =
      this.items.find(
        producto =>
          producto.variacion_id ===
          variacion_id
      );


    if (!item) {

      return;

    }


    // ===================================================
    // NORMALIZAR CANTIDAD
    // ===================================================

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


    // ===================================================
    // STOCK
    // ===================================================

    const stock =
      Number(
        item.stock
      );


    // ===================================================
    // SI NO HAY STOCK
    // ===================================================

    if (
      !Number.isNaN(stock) &&
      stock <= 0
    ) {

      item.cantidad = 0;

      this.actualizarCarrito();

      return;

    }


    // ===================================================
    // NO SUPERAR STOCK
    // ===================================================

    if (
      !Number.isNaN(stock)
    ) {

      nuevaCantidad =
        Math.min(
          nuevaCantidad,
          stock
        );

    }


    item.cantidad =
      nuevaCantidad;


    this.actualizarCarrito();

  }


  // =====================================================
  // AUMENTAR CANTIDAD
  // =====================================================

  aumentarCantidad(
    variacion_id: number
  ): void {

    const item =
      this.items.find(
        producto =>
          producto.variacion_id ===
          variacion_id
      );


    if (!item) {

      return;

    }


    const stock =
      Number(
        item.stock
      );


    const cantidadActual =
      Number(
        item.cantidad
      );


    // ===================================================
    // NO SUPERAR STOCK
    // ===================================================

    if (
      !Number.isNaN(stock) &&
      cantidadActual >= stock
    ) {

      return;

    }


    this.cambiarCantidad(
      variacion_id,
      cantidadActual + 1
    );

  }


  // =====================================================
  // DISMINUIR CANTIDAD
  // =====================================================

  disminuirCantidad(
    variacion_id: number
  ): void {

    const item =
      this.items.find(
        producto =>
          producto.variacion_id ===
          variacion_id
      );


    if (!item) {

      return;

    }


    const cantidadActual =
      Number(
        item.cantidad
      );


    // ===================================================
    // MÍNIMO 1
    // ===================================================

    if (
      cantidadActual <= 1
    ) {

      return;

    }


    this.cambiarCantidad(
      variacion_id,
      cantidadActual - 1
    );

  }


  // =====================================================
  // OBTENER ITEMS
  // =====================================================

  obtenerItems():
    ItemCarrito[] {

    return this.items.map(
      item => ({
        ...item
      })
    );

  }


  // =====================================================
  // OBTENER TOTAL
  //
  // IMPORTANTE:
  // Este total es únicamente visual.
  //
  // El backend vuelve a consultar los precios en MySQL
  // antes de guardar la cotización.
  // =====================================================

  obtenerTotal():
    number {

    return this.items.reduce(
      (
        total,
        item
      ) => {

        const precio =
          Number(
            item.precio
          );


        const cantidad =
          Number(
            item.cantidad
          );


        return (
          total +
          (
            precio *
            cantidad
          )
        );

      },
      0
    );

  }


  // =====================================================
  // CANTIDAD TOTAL DE UNIDADES
  // =====================================================

  obtenerCantidadTotal():
    number {

    return this.items.reduce(
      (
        total,
        item
      ) => {

        return (
          total +
          Number(
            item.cantidad
          )
        );

      },
      0
    );

  }


  // =====================================================
  // CANTIDAD DE PRODUCTOS / VARIACIONES
  // =====================================================

  obtenerCantidadItems():
    number {

    return this.items.length;

  }


  // =====================================================
  // CARRITO VACÍO
  // =====================================================

  estaVacio():
    boolean {

    return (
      this.items.length === 0
    );

  }


  // =====================================================
  // VACIAR CARRITO
  // =====================================================

  vaciarCarrito():
    void {

    this.items = [];


    this.actualizarCarrito();

  }


  // =====================================================
  // GENERAR ENLACE WHATSAPP
  // =====================================================

  generarEnlaceWhatsApp(
    telefonoEmpresa: string
  ): string {

    let mensaje =
      '*SOLICITUD DE COTIZACIÓN - KASAL INVERSIONES SAC*\n';


    mensaje +=
      '===================================\n\n';


    // ===================================================
    // PRODUCTOS
    // ===================================================

    this.items.forEach(
      item => {

        const precio =
          Number(
            item.precio
          );


        const cantidad =
          Number(
            item.cantidad
          );


        const subtotal =
          precio *
          cantidad;


        mensaje +=
          `• *${item.nombre}*\n`;


        mensaje +=
          `  Talla: ${item.talla}\n`;


        mensaje +=
          `  Cantidad: ${cantidad}\n`;


        mensaje +=
          `  Precio referencial: S/ ${precio.toFixed(2)}\n`;


        mensaje +=
          `  Subtotal: S/ ${subtotal.toFixed(2)}\n\n`;

      }
    );


    // ===================================================
    // TOTAL
    // ===================================================

    mensaje +=
      '===================================\n';


    mensaje +=
      `*TOTAL ESTIMADO: S/ ${this.obtenerTotal().toFixed(2)}*\n\n`;


    mensaje +=
      'Solicito confirmación de stock, precios y detalles para la emisión de la cotización.';


    // ===================================================
    // URL
    // ===================================================

    return (
      `https://wa.me/${telefonoEmpresa}` +
      `?text=${encodeURIComponent(mensaje)}`
    );

  }


  // =====================================================
  // ACTUALIZAR CARRITO
  // =====================================================

  private actualizarCarrito():
    void {

    // ===================================================
    // ELIMINAR ITEMS INVÁLIDOS
    // ===================================================

    this.items =
      this.items.filter(
        item => {

          return (
            Number(item.cantidad) > 0 &&
            Number(item.stock) > 0
          );

        }
      );


    // ===================================================
    // EMITIR NUEVA REFERENCIA
    // ===================================================

    this.carritoSubject.next(
      this.items.map(
        item => ({
          ...item
        })
      )
    );


    // ===================================================
    // LOCALSTORAGE
    // ===================================================

    this.guardarEnStorage();

  }


  // =====================================================
  // GUARDAR EN LOCALSTORAGE
  // =====================================================

  private guardarEnStorage():
    void {

    try {

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(
          this.items
        )
      );

    } catch (error) {

      console.error(
        'Error guardando carrito:',
        error
      );

    }

  }


  // =====================================================
  // CARGAR DESDE LOCALSTORAGE
  // =====================================================

  private cargarDesdeStorage():
    ItemCarrito[] {

    try {

      const carritoGuardado =
        localStorage.getItem(
          this.storageKey
        );


      // =================================================
      // NO EXISTE
      // =================================================

      if (
        !carritoGuardado
      ) {

        return [];

      }


      // =================================================
      // PARSEAR
      // =================================================

      const datos:
        unknown =
          JSON.parse(
            carritoGuardado
          );


      // =================================================
      // DEBE SER ARRAY
      // =================================================

      if (
        !Array.isArray(
          datos
        )
      ) {

        return [];

      }


      // =================================================
      // VALIDAR ITEMS BÁSICOS
      // =================================================

      return datos.filter(
        (
          item
        ): item is ItemCarrito => {

          if (
            !item ||
            typeof item !==
              'object'
          ) {

            return false;

          }


          const producto =
            item as Partial<ItemCarrito>;


          return (

            typeof producto.variacion_id ===
              'number' &&

            typeof producto.producto_id ===
              'number' &&

            typeof producto.nombre ===
              'string' &&

            typeof producto.talla ===
              'string' &&

            typeof producto.precio ===
              'number' &&

            typeof producto.cantidad ===
              'number' &&

            typeof producto.stock ===
              'number' &&

            producto.cantidad > 0 &&

            producto.stock > 0

          );

        }
      );

    } catch (error) {

      console.error(
        'Error cargando carrito:',
        error
      );


      return [];

    }

  }

}