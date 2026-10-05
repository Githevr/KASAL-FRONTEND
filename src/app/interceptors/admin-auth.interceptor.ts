import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  AdminAuthService
} from '../services/admin-auth';


export const adminAuthInterceptor:
  HttpInterceptorFn = (
    req,
    next
  ) => {


  const authService =
    inject(AdminAuthService);

  const router =
    inject(Router);


  // =====================================================
  // SOLO PARA RUTAS ADMINISTRATIVAS
  // =====================================================

  const esRutaAdmin =
    req.url.includes(
      '/api/admin'
    );


  if (!esRutaAdmin) {

    return next(req);

  }


  // =====================================================
  // OBTENER TOKEN
  // =====================================================

  const token =
    authService.obtenerToken();


  // =====================================================
  // AGREGAR JWT
  // =====================================================

  let request = req;


  if (token) {

    request =
      req.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`

        }

      });

  }


  // =====================================================
  // EJECUTAR PETICIÓN
  // =====================================================

  return next(request)
    .pipe(

      catchError(
        (
          error:
            HttpErrorResponse
        ) => {


          // =============================================
          // TOKEN INVÁLIDO / EXPIRADO
          // =============================================

          if (
            error.status === 401
          ) {

            authService
              .cerrarSesion();


            router.navigate([
              '/admin/login'
            ]);

          }


          return throwError(
            () => error
          );

        }
      )

    );

};