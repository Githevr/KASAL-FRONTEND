export interface Variacion {
  variacion_id: number;
  producto_id?: number; // <-- Agregado para permitir producto_id en las variaciones
  talla: string;
  precio: number;
  stock: number;
}

export interface Producto {
  producto_id: number;
  nombre: string;
  categoria: string;
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