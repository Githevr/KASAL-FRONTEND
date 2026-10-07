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
// VARIACIÓN
// =====================================================

export interface AdminVariacion {

  variacion_id?: number;

  producto_id?: number;

  talla: string;

  sku: string | null;

  precio: number;

  stock: number;

  activo: number;

}


// =====================================================
// SECTOR DE UN PRODUCTO
// =====================================================

export interface AdminSector {

  sector_id: number;

  nombre: string;

  slug: string;

}


// =====================================================
// PRODUCTO ADMINISTRATIVO
// =====================================================

export interface AdminProducto {

  producto_id: number;

  categoria_id: number | null;

  categoria: string | null;

  nombre: string;

  descripcion: string | null;

  ficha_tecnica_url: string | null;

  imagen_url: string | null;

  slug: string | null;

  activo: number;

  creado_en?: string;

  variaciones: AdminVariacion[];

  sectores: AdminSector[];

}


// =====================================================
// CATEGORÍA
// =====================================================

export interface AdminCategoria {

  id: number;

  nombre: string;

  slug: string;

}


// =====================================================
// SECTOR PARA FORMULARIO
// =====================================================

export interface AdminSectorFormulario {

  id: number;

  nombre: string;

  slug: string;

  activo: number;

}


// =====================================================
// NUEVA VARIACIÓN
// =====================================================

export interface NuevaVariacion {

  id?: number;

  talla: string;

  sku: string | null;

  precio: number;

  stock: number;

  activo: number;

}


// =====================================================
// NUEVO PRODUCTO / PRODUCTO PARA EDITAR
// =====================================================

export interface NuevoProducto {

  categoria_id: number | null;

  nombre: string;

  descripcion: string | null;

  ficha_tecnica_url: string | null;

  imagen_url: string | null;

  slug: string | null;

  activo: number;

  sectores: number[];

  variaciones: NuevaVariacion[];

}


// =====================================================
// RESPUESTA CREAR PRODUCTO
// =====================================================

export interface CrearProductoResponse {

  mensaje: string;

  producto_id: number;

  imagen_url?: string | null;

  ficha_tecnica_url?: string | null;

}


// =====================================================
// RESPUESTA ACTUALIZAR PRODUCTO
// =====================================================

export interface ActualizarProductoResponse {

  mensaje: string;

  producto_id?: number;

  imagen_url?: string | null;

  ficha_tecnica_url?: string | null;

}


// =====================================================
// RESPUESTA GENERAL
// =====================================================

export interface MensajeResponse {

  mensaje: string;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class AdminProductosService {


  // ===================================================
  // URL BASE
  // ===================================================

  private readonly apiUrl =
  `${environment.apiUrl}/admin/productos`;

  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(

    private http:
      HttpClient

  ) {}


  // ===================================================
  // LISTAR PRODUCTOS
  //
  // GET /api/admin/productos
  // ===================================================

  obtenerProductos():
    Observable<AdminProducto[]> {

    return this.http.get<
      AdminProducto[]
    >(
      this.apiUrl
    );

  }


  // ===================================================
  // OBTENER PRODUCTO POR ID
  //
  // GET /api/admin/productos/:id
  // ===================================================

  obtenerProductoPorId(
    id: number
  ): Observable<AdminProducto> {

    return this.http.get<
      AdminProducto
    >(
      `${this.apiUrl}/${id}`
    );

  }


  // ===================================================
  // CATEGORÍAS
  //
  // GET /api/admin/productos/categorias
  // ===================================================

  obtenerCategorias():
    Observable<AdminCategoria[]> {

    return this.http.get<
      AdminCategoria[]
    >(
      `${this.apiUrl}/categorias`
    );

  }


  // ===================================================
  // SECTORES
  //
  // GET /api/admin/productos/sectores
  // ===================================================

  obtenerSectores():
    Observable<AdminSectorFormulario[]> {

    return this.http.get<
      AdminSectorFormulario[]
    >(
      `${this.apiUrl}/sectores`
    );

  }


  // ===================================================
  // CREAR FORMDATA
  //
  // Se reutiliza tanto para CREAR como para EDITAR.
  // ===================================================

  private crearFormDataProducto(

    producto: NuevoProducto,

    imagen?: File | null,

    fichaTecnica?: File | null

  ): FormData {


    const formData =
      new FormData();


    // =================================================
    // CATEGORÍA
    // =================================================

    if (
      producto.categoria_id !== null &&
      producto.categoria_id !== undefined
    ) {

      formData.append(
        'categoria_id',
        String(
          producto.categoria_id
        )
      );

    }


    // =================================================
    // DATOS BÁSICOS
    // =================================================

    formData.append(
      'nombre',
      producto.nombre
    );


    formData.append(
      'descripcion',
      producto.descripcion || ''
    );


    formData.append(
      'slug',
      producto.slug || ''
    );


    formData.append(
      'activo',
      String(
        producto.activo
      )
    );


    // =================================================
    // SECTORES
    // =================================================

    formData.append(
      'sectores',
      JSON.stringify(
        producto.sectores
      )
    );


    // =================================================
    // VARIACIONES
    // =================================================

    formData.append(
      'variaciones',
      JSON.stringify(
        producto.variaciones
      )
    );


    // =================================================
    // IMAGEN NUEVA
    // =================================================

    if (imagen) {

      formData.append(
        'imagen',
        imagen,
        imagen.name
      );

    }


    // =================================================
    // FICHA TÉCNICA NUEVA
    // =================================================

    if (fichaTecnica) {

      formData.append(
        'ficha_tecnica',
        fichaTecnica,
        fichaTecnica.name
      );

    }


    return formData;

  }


  // ===================================================
  // CREAR PRODUCTO
  //
  // POST /api/admin/productos
  // ===================================================

  crearProducto(

    producto: NuevoProducto,

    imagen?: File | null,

    fichaTecnica?: File | null

  ): Observable<CrearProductoResponse> {


    const formData =
      this.crearFormDataProducto(

        producto,

        imagen,

        fichaTecnica

      );


    return this.http.post<
      CrearProductoResponse
    >(

      this.apiUrl,

      formData

    );

  }


  // ===================================================
  // ACTUALIZAR PRODUCTO
  //
  // PUT /api/admin/productos/:id
  //
  // Si imagen === null:
  // el backend conserva la imagen existente.
  //
  // Si fichaTecnica === null:
  // el backend conserva el PDF existente.
  // ===================================================

  actualizarProducto(

    id: number,

    producto: NuevoProducto,

    imagen?: File | null,

    fichaTecnica?: File | null

  ): Observable<ActualizarProductoResponse> {


    const formData =
      this.crearFormDataProducto(

        producto,

        imagen,

        fichaTecnica

      );


    return this.http.put<
      ActualizarProductoResponse
    >(

      `${this.apiUrl}/${id}`,

      formData

    );

  }


  // ===================================================
  // CAMBIAR ESTADO
  //
  // PATCH /api/admin/productos/:id/estado
  // ===================================================

  cambiarEstado(

    id: number,

    activo: boolean

  ): Observable<MensajeResponse> {

    return this.http.patch<
      MensajeResponse
    >(

      `${this.apiUrl}/${id}/estado`,

      {
        activo
      }

    );

  }

}