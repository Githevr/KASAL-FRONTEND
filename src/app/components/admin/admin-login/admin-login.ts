import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AdminAuthService
} from '../../../services/admin-auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLoginComponent {

  email = '';
  password = '';

  cargando = false;
  error = '';

  constructor(
    private authService: AdminAuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  iniciarSesion(): void {

    this.error = '';

    const email =
      this.email.trim();

    if (!email || !this.password) {
      this.error =
        'Ingresa tu correo y contraseña.';
      return;
    }

    this.cargando = true;

    this.authService
      .login(
        email,
        this.password
      )
      .subscribe({
        next: () => {

          this.cargando = false;

          this.router.navigate([
            '/admin'
          ]);
        },

        error: (error) => {

          console.error(
            'Error al iniciar sesión:',
            error
          );

          this.cargando = false;

          this.error =
            error?.error?.mensaje ||
            'No se pudo iniciar sesión.';

          this.cdr.detectChanges();
        }
      });
  }
}