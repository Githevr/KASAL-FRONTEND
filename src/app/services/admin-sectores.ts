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
// SECTOR
// =====================================================

export interface AdminSector {

  id: number;

  nombre: string;

  slug: string;

  activo: number;

  total_productos: number;

}


// =====================================================
// DATOS PARA CREAR / EDITAR
// =====================================================

export interface SectorPayload {

  nombre: string;

  slug: string;

  activo: number;

}


// =====================================================
// RESPUESTA CREAR / EDITAR
// =====================================================

export interface SectorResponse {

  mensaje: string;

  sector: AdminSector;

}


// =====================================================
// RESPUESTA CAMBIO DE ESTADO
// =====================================================

export interface SectorEstadoResponse {

  mensaje: string;

  activo: number;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class AdminSectoresService {


  // ===================================================
  // URL BASE
  // ===================================================

  private readonly apiUrl =
  `${environment.apiUrl}/admin/sectores`;


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private http:
      HttpClient

  ) {}


  // ===================================================
  // LISTAR SECTORES
  //
  // GET /api/admin/sectores
  // ===================================================

  obtenerSectores():
    Observable<AdminSector[]> {

    return this.http.get<
      AdminSector[]
    >(
      this.apiUrl
    );

  }


  // ===================================================
  // OBTENER SECTOR POR ID
  //
  // GET /api/admin/sectores/:id
  // ===================================================

  obtenerSectorPorId(
    id: number
  ): Observable<AdminSector> {

    return this.http.get<
      AdminSector
    >(
      `${this.apiUrl}/${id}`
    );

  }


  // ===================================================
  // CREAR SECTOR
  //
  // POST /api/admin/sectores
  // ===================================================

  crearSector(
    sector: SectorPayload
  ): Observable<SectorResponse> {

    return this.http.post<
      SectorResponse
    >(

      this.apiUrl,

      sector

    );

  }


  // ===================================================
  // ACTUALIZAR SECTOR
  //
  // PUT /api/admin/sectores/:id
  // ===================================================

  actualizarSector(

    id: number,

    sector: SectorPayload

  ): Observable<SectorResponse> {

    return this.http.put<
      SectorResponse
    >(

      `${this.apiUrl}/${id}`,

      sector

    );

  }


  // ===================================================
  // CAMBIAR ESTADO
  //
  // PATCH /api/admin/sectores/:id/estado
  // ===================================================

  cambiarEstado(

    id: number,

    activo: boolean

  ): Observable<SectorEstadoResponse> {

    return this.http.patch<
      SectorEstadoResponse
    >(

      `${this.apiUrl}/${id}/estado`,

      {
        activo
      }

    );

  }

}