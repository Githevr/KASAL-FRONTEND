
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


// =====================================================
// MODELO DE CATEGORÍA PÚBLICA
// =====================================================

export interface Categoria {

  id: number;

  nombre: string;

  slug: string;

  categoria_padre_id: number | null;

  categoria_padre_nombre: string | null;

}


// =====================================================
// SERVICIO DE CATEGORÍAS PÚBLICAS
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private readonly apiUrl =
    `${environment.apiUrl}/categorias`;


  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // OBTENER TODAS LAS CATEGORÍAS
  // ===================================================

  obtenerCategorias(): Observable<Categoria[]> {

    return this.http.get<Categoria[]>(
      this.apiUrl
    );

  }

}
