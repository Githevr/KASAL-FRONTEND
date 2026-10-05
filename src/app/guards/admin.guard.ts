import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  catchError,
  map,
  of
} from 'rxjs';

import {
  AdminAuthService
} from '../services/admin-auth';


export const adminGuard:
  CanActivateFn = () => {


  // =====================================================
  // SERVICIOS
  // =====================================================

  const authService =
    inject(AdminAuthService);

  const router =
    inject(Router);


  // =====================================================
  // NO EXISTE TOKEN
  // =====================================================

  if (
    !authService.tieneToken()
  ) {

    return router.createUrlTree([
      '/admin/login'
    ]);

  }


  // =====================================================
  // VERIFICAR TOKEN CON BACKEND
  // =====================================================

  return authService
    .verificarSesion()
    .pipe(

      map((respuesta) => {

        if (
          respuesta.autenticado
        ) {

          return true;

        }


        authService
          .cerrarSesion();


        return router.createUrlTree([
          '/admin/login'
        ]);

      }),


      catchError(() => {

        authService
          .cerrarSesion();


        return of(
          router.createUrlTree([
            '/admin/login'
          ])
        );

      })

    );

};