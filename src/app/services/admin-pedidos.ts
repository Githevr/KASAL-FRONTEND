import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../environments/environment';

// =====================================================
// ESTADOS DEL PEDIDO / COTIZACIÓN
// =====================================================

export type EstadoPedido =
  | 'nuevo'
  | 'en_revision'
  | 'cotizado'
  | 'confirmado'
  | 'cancelado';


// =====================================================
// ORIGEN
// =====================================================

export type OrigenPedido =
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'directo';


// =====================================================
// DETALLE DEL PEDIDO
// =====================================================

export interface AdminPedidoDetalle {

  detalle_id: number;

  pedido_id: number;

  variacion_id: number;

  cantidad: number;

  precio_unitario: number;

  subtotal: number;

  talla: string;

  sku: string | null;

  producto_id: number;

  producto_nombre: string;

  imagen_url: string | null;

  categoria?: string | null;

}


// =====================================================
// PEDIDO PARA LISTADO
// =====================================================

export interface AdminPedido {

  id: number;

  usuario_id: number | null;

  total: number;

  estado: EstadoPedido;

  stock_descontado: number;

  fecha: string;

  nombre_cliente: string | null;

  empresa_cliente: string | null;

  ruc_cliente: string | null;

  telefono_cliente: string | null;

  email_cliente: string | null;

  mensaje_cliente: string | null;

  origen: OrigenPedido;

  total_items?: number;

  total_unidades?: number;

}


// =====================================================
// PEDIDO COMPLETO
// =====================================================

export interface AdminPedidoCompleto
  extends AdminPedido {

  detalles: AdminPedidoDetalle[];

}


// =====================================================
// RESPUESTA CAMBIO DE ESTADO
// =====================================================

export interface AdminPedidoMensajeResponse {

  mensaje: string;

  pedido_id?: number;

  estado?: EstadoPedido;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class AdminPedidosService {


  // ===================================================
  // URL BASE
  // ===================================================

  private readonly apiUrl =
  `${environment.apiUrl}/admin/cotizaciones`;


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private http:
      HttpClient

  ) {}


  // ===================================================
  // LISTAR COTIZACIONES
  //
  // GET /api/admin/cotizaciones
  // ===================================================

  obtenerPedidos():
    Observable<AdminPedido[]> {

    return this.http.get<
      AdminPedido[]
    >(
      this.apiUrl
    );

  }


  // ===================================================
  // OBTENER COTIZACIÓN POR ID
  //
  // GET /api/admin/cotizaciones/:id
  // ===================================================

  obtenerPedidoPorId(
    id: number
  ): Observable<AdminPedidoCompleto> {

    return this.http.get<
      AdminPedidoCompleto
    >(
      `${this.apiUrl}/${id}`
    );

  }


  // ===================================================
  // CAMBIAR ESTADO
  //
  // PATCH /api/admin/cotizaciones/:id/estado
  // ===================================================

  cambiarEstado(

    id: number,

    estado: EstadoPedido

  ): Observable<
    AdminPedidoMensajeResponse
  > {

    return this.http.patch<
      AdminPedidoMensajeResponse
    >(

      `${this.apiUrl}/${id}/estado`,

      {
        estado
      }

    );

  }

}