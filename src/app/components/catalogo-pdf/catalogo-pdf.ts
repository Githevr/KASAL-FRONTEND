import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalogo-pdf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo-pdf.html',
  styleUrl: './catalogo-pdf.css'
})
export class CatalogoPdfComponent {

  catalogos = [
    {
      nombre: 'Seguridad y Protección Industrial',
      descripcion: 'Guantes, cascos, lentes, mascarillas, calzado y equipos de protección.',
      url: '/catalogos/catalogo-seguridad.pdf',
      archivo: 'catalogo-seguridad.pdf',
      paginas: 46
    },
    {
      nombre: 'Suministros Consumibles',
      descripcion: 'Adhesivos, selladores, lubricantes y soluciones de mantenimiento industrial.',
      url: '/catalogos/catalogo-suministros.pdf',
      archivo: 'catalogo-suministros.pdf',
      paginas: 28
    }
  ];

    pdfUrl = this.catalogos[0].url;

    constructor(private sanitizer: DomSanitizer) {}

    get pdfUrlSegura(): SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        this.pdfUrl
      );
    }
}