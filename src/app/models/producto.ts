export interface Variacion {
  variacion_id: number;
  producto_id?: number;
  talla: string;
  precio: number;
  stock: number;
}

export interface Producto {
  producto_id: number;
  nombre: string;
  categoria: string;

  // Categoría principal: guantes, epps o suministros
  categoria_principal?: string;

  descripcion: string;
  imagen_url?: string;
  variaciones?: Variacion[];
}

export interface ItemCarrito {
  variacion_id: number;
  producto_id: number;
  nombre: string;
  talla: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen_url?: string;
}