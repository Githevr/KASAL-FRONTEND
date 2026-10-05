import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../environments/environment';


export interface AdminLoginResponse {

  mensaje: string;

  token: string;

  administrador: {
    id: number;
    nombre: string;
    email: string;
  };

}


export interface AdminVerificarResponse {

  autenticado: boolean;

  administrador: {
    id: number;
    nombre: string;
    email: string;
  };

}


@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {


  // =====================================================
  // API
  // =====================================================

  private readonly apiUrl =
    `${environment.apiUrl}/admin`;


  // =====================================================
  // TOKEN
  // =====================================================

  private readonly tokenKey =
    'kasal_admin_token';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // LOGIN
  // =====================================================

  login(
    email: string,
    password: string
  ): Observable<AdminLoginResponse> {

    return this.http
      .post<AdminLoginResponse>(
        `${this.apiUrl}/login`,
        {
          email,
          password
        }
      )
      .pipe(

        tap((respuesta) => {

          localStorage.setItem(
            this.tokenKey,
            respuesta.token
          );

        })

      );

  }


  // =====================================================
  // OBTENER TOKEN
  // =====================================================

  obtenerToken(): string | null {

    return localStorage.getItem(
      this.tokenKey
    );

  }


  // =====================================================
  // VERIFICAR SESIÓN CONTRA EL BACKEND
  // =====================================================

  verificarSesion():
    Observable<AdminVerificarResponse> {

    const token =
      this.obtenerToken();


    const headers =
      new HttpHeaders({
        Authorization:
          `Bearer ${token}`
      });


    return this.http.get<AdminVerificarResponse>(
      `${this.apiUrl}/verificar`,
      {
        headers
      }
    );

  }


  // =====================================================
  // EXISTE TOKEN
  // =====================================================

  tieneToken(): boolean {

    return !!this.obtenerToken();

  }


  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  cerrarSesion(): void {

    localStorage.removeItem(
      this.tokenKey
    );

  }

}