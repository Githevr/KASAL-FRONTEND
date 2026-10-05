import { Routes } from '@angular/router';

import {
  InicioComponent
} from './components/inicio/inicio';

import {
  CatalogoComponent
} from './components/catalogo/catalogo';

import {
  DetalleProductoComponent
} from './components/detalle-producto/detalle-producto';

import {
  ContactoComponent
} from './components/contacto/contacto';

import {
  CotizacionComponent
} from './components/cotizacion/cotizacion';


// =====================================================
// ADMIN
// =====================================================

import {
  AdminLoginComponent
} from './components/admin/admin-login/admin-login';

import {
  AdminLayoutComponent
} from './components/admin/admin-layout/admin-layout';

import {
  AdminPanelComponent
} from './components/admin/admin-panel/admin-panel';

import {
  AdminProductosComponent
} from './components/admin/admin-productos/admin-productos';

import {
  AdminProductoFormComponent
} from './components/admin/admin-producto-form/admin-producto-form';

import {
  AdminCategoriasComponent
} from './components/admin/admin-categorias/admin-categorias';

import {
  AdminSectoresComponent
} from './components/admin/admin-sectores/admin-sectores';

import {
  AdminCotizacionesComponent
} from './components/admin/admin-cotizaciones/admin-cotizaciones';

import {
  AdminCotizacionDetalleComponent
} from './components/admin/admin-cotizacion-detalle/admin-cotizacion-detalle';


// =====================================================
// GUARD
// =====================================================

import {
  adminGuard
} from './guards/admin.guard';


export const routes: Routes = [

  // =====================================================
  // PÁGINA DE INICIO
  // =====================================================

  {
    path: '',
    component: InicioComponent
  },


  // =====================================================
  // CATÁLOGO
  // =====================================================

  {
    path: 'tienda',
    component: CatalogoComponent
  },


  // =====================================================
  // COTIZACIÓN
  // =====================================================

  {
    path: 'cotizacion',
    component: CotizacionComponent
  },


  // =====================================================
  // DETALLE PRODUCTO
  // =====================================================

  {
    path: 'producto/:id',
    component: DetalleProductoComponent
  },


  // =====================================================
  // CONTACTO
  // =====================================================

  {
    path: 'contacto',
    component: ContactoComponent
  },


  // =====================================================
  // LOGIN ADMIN
  // FUERA DEL LAYOUT
  // =====================================================

  {
    path: 'admin/login',
    component: AdminLoginComponent
  },


  // =====================================================
  // LAYOUT ADMINISTRATIVO
  // =====================================================

  {
    path: 'admin',

    component:
      AdminLayoutComponent,

    canActivate: [
      adminGuard
    ],

    children: [

      // =================================================
      // DASHBOARD
      // /admin
      // =================================================

      {
        path: '',
        component:
          AdminPanelComponent
      },


      // =================================================
      // NUEVO PRODUCTO
      // /admin/productos/nuevo
      // =================================================

      {
        path: 'productos/nuevo',
        component:
          AdminProductoFormComponent
      },


      // =================================================
      // EDITAR PRODUCTO
      // /admin/productos/1/editar
      // =================================================

      {
        path: 'productos/:id/editar',
        component:
          AdminProductoFormComponent
      },


      // =================================================
      // PRODUCTOS
      // /admin/productos
      // =================================================

      {
        path: 'productos',
        component:
          AdminProductosComponent
      },


      // =================================================
      // CATEGORÍAS
      // /admin/categorias
      // =================================================

      {
        path: 'categorias',
        component:
          AdminCategoriasComponent
      },


      // =================================================
      // SECTORES
      // /admin/sectores
      // =================================================

      {
        path: 'sectores',
        component:
          AdminSectoresComponent
      },


      // =================================================
      // DETALLE COTIZACIÓN
      // /admin/cotizaciones/2
      // =================================================

      {
        path: 'cotizaciones/:id',
        component:
          AdminCotizacionDetalleComponent
      },


      // =================================================
      // COTIZACIONES
      // /admin/cotizaciones
      // =================================================

      {
        path: 'cotizaciones',
        component:
          AdminCotizacionesComponent
      }

    ]
  },


  // =====================================================
  // RUTA NO ENCONTRADA
  // SIEMPRE AL FINAL
  // =====================================================

  {
    path: '**',
    redirectTo: ''
  }

];