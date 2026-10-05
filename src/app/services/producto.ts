import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  of,
  tap
} from 'rxjs';

import { Producto } from '../models/producto';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl =
    'http://localhost:3000/api/productos';


  // =====================================================
  // CACHÉ GENERAL
  // Solo almacena el catálogo completo.
  // Los filtros por sector siempre consultan el backend.
  // =====================================================

  private productosCache:
    Producto[] | null = null;


  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // OBTENER PRODUCTOS
  //
  // Sin sector:
  // /api/productos
  //
  // Con sector:
  // /api/productos?sector=mineria
  // =====================================================

  obtenerProductos(
    sector: string = ''
  ): Observable<Producto[]> {

    const sectorNormalizado =
      sector
        .trim()
        .toLowerCase();


    // ===================================================
    // SI HAY SECTOR
    // Consultar siempre el backend.
    // ===================================================

    if (sectorNormalizado) {

      const params =
        new HttpParams()
          .set(
            'sector',
            sectorNormalizado
          );


      return this.http.get<Producto[]>(
        this.apiUrl,
        { params }
      );

    }


    // ===================================================
    // SIN SECTOR
    // Podemos utilizar caché.
    // ===================================================

    if (this.productosCache !== null) {

      return of(
        this.productosCache
      );

    }


    // ===================================================
    // PRIMERA CARGA DEL CATÁLOGO COMPLETO
    // ===================================================

    return this.http
      .get<Producto[]>(
        this.apiUrl
      )
      .pipe(

        tap(
          (productos: Producto[]) => {

            this.productosCache = [
              ...productos
            ];

          }
        )

      );

  }


  // =====================================================
  // OBTENER PRODUCTO POR ID
  // =====================================================

  obtenerProductoPorId(
    id: number
  ): Observable<Producto> {

    // ===================================================
    // BUSCAR PRIMERO EN CACHÉ GENERAL
    // ===================================================

    const productoCache =
      this.productosCache?.find(
        producto =>
          producto.producto_id === id
      );


    if (productoCache) {

      return of(
        productoCache
      );

    }


    // ===================================================
    // SI NO ESTÁ EN CACHÉ
    // CONSULTAR BACKEND
    // ===================================================

    return this.http.get<Producto>(
      `${this.apiUrl}/${id}`
    );

  }


  // =====================================================
  // LIMPIAR CACHÉ
  // =====================================================

  limpiarCache(): void {

    this.productosCache = null;

  }

}