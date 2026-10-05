import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


// =====================================================
// PRODUCTO DE LA SOLICITUD
// =====================================================

export interface ProductoSolicitudCotizacion {

  variacion_id: number;

  cantidad: number;

}


// =====================================================
// NUEVA COTIZACIÓN
// =====================================================

export interface NuevaCotizacion {

  nombre_cliente: string;

  empresa_cliente: string | null;

  ruc_cliente: string | null;

  telefono_cliente: string;

  email_cliente: string | null;

  mensaje_cliente: string | null;

  origen:
    'directo' |
    'instagram' |
    'facebook' |
    'tiktok';

  productos:
    ProductoSolicitudCotizacion[];

}


// =====================================================
// RESPUESTA BACKEND
// =====================================================

export interface CrearCotizacionResponse {

  mensaje: string;

  pedido_id: number;

  total: number;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {


  // ===================================================
  // API
  // ===================================================

  private readonly apiUrl =
    'http://localhost:3000/api/cotizaciones';


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // CREAR COTIZACIÓN
  // ===================================================

  crearCotizacion(
    cotizacion: NuevaCotizacion
  ): Observable<CrearCotizacionResponse> {

    return this.http.post<CrearCotizacionResponse>(
      this.apiUrl,
      cotizacion
    );

  }

}