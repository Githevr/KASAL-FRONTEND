import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import {environment} from '../../environments/environment';


// =====================================================
// CATEGORÍA
// =====================================================

export interface AdminCategoria {

  id: number;

  nombre: string;

  slug: string;

  // ID de la categoría principal.
  // null significa que esta categoría es principal.
  categoria_padre_id: number | null;

  // Nombre de la categoría principal.
  categoria_padre_nombre?: string | null;

  total_productos: number;

}


// =====================================================
// DATOS PARA CREAR / EDITAR
// =====================================================

export interface CategoriaPayload {

  nombre: string;

  slug: string;

  // Opcional por compatibilidad con formularios existentes.
  categoria_padre_id?: number | null;

}


// =====================================================
// RESPUESTA DEL BACKEND
// =====================================================

export interface CategoriaResponse {

  mensaje: string;

  categoria: AdminCategoria;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class AdminCategoriasService {


  // ===================================================
  // API
  // ===================================================

  private readonly apiUrl =
    `${environment.apiUrl}/admin/categorias`;


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private http:
      HttpClient

  ) {}


  // ===================================================
  // LISTAR
  //
  // GET /api/admin/categorias
  // ===================================================

  obtenerCategorias():
    Observable<AdminCategoria[]> {

    return this.http.get<
      AdminCategoria[]
    >(
      this.apiUrl
    );

  }


  // ===================================================
  // OBTENER POR ID
  //
  // GET /api/admin/categorias/:id
  // ===================================================

  obtenerCategoriaPorId(
    id: number
  ): Observable<AdminCategoria> {

    return this.http.get<
      AdminCategoria
    >(
      `${this.apiUrl}/${id}`
    );

  }


  // ===================================================
  // CREAR
  //
  // POST /api/admin/categorias
  // ===================================================

  crearCategoria(
    categoria: CategoriaPayload
  ): Observable<CategoriaResponse> {

    return this.http.post<
      CategoriaResponse
    >(
      this.apiUrl,
      categoria
    );

  }


  // ===================================================
  // ACTUALIZAR
  //
  // PUT /api/admin/categorias/:id
  // ===================================================

  actualizarCategoria(

    id: number,

    categoria: CategoriaPayload

  ): Observable<CategoriaResponse> {

    return this.http.put<
      CategoriaResponse
    >(
      `${this.apiUrl}/${id}`,
      categoria
    );

  }

}