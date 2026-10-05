import {
  Component
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import {
  AdminAuthService
} from '../../../services/admin-auth';


@Component({
  selector: 'app-admin-layout',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],

  templateUrl:
    './admin-layout.html',

  styleUrl:
    './admin-layout.css'
})
export class AdminLayoutComponent {


  // =====================================================
  // MENÚ
  // =====================================================

  menuAbierto = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private authService:
      AdminAuthService,

    private router:
      Router

  ) {}


  // =====================================================
  // ABRIR / CERRAR MENÚ
  // =====================================================

  toggleMenu(): void {

    this.menuAbierto =
      !this.menuAbierto;

  }


  // =====================================================
  // CERRAR MENÚ
  // =====================================================

  cerrarMenu(): void {

    this.menuAbierto = false;

  }


  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  cerrarSesion(): void {

    this.authService
      .cerrarSesion();


    this.menuAbierto = false;


    this.router.navigate([
      '/admin/login'
    ]);

  }

}