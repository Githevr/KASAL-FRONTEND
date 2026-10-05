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

import {
  environment
} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly apiUrl =
    `${environment.apiUrl}/productos`;


  // =====================================================
  // CACHE GENERAL
  // Solo almacena el catalogo completo.
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
    // Podemos utilizar cache.
    // ===================================================

    if (this.productosCache !== null) {

      return of(
        this.productosCache
      );

    }


    // ===================================================
    // PRIMERA CARGA DEL CATALOGO COMPLETO
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
    // BUSCAR PRIMERO EN CACHE GENERAL
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
    // SI NO ESTA EN CACHE
    // CONSULTAR BACKEND
    // ===================================================

    return this.http.get<Producto>(
      `${this.apiUrl}/${id}`
    );

  }


  // =====================================================
  // LIMPIAR CACHE
  // =====================================================

  limpiarCache(): void {

    this.productosCache = null;

  }

}