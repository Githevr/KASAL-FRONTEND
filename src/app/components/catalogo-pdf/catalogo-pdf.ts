
import { Component } from '@angular/core';

@Component({
  selector: 'app-catalogo-pdf',
  standalone: true,
  templateUrl: './catalogo-pdf.html',
  styleUrl: './catalogo-pdf.css'
})
export class CatalogoPdfComponent {
  pdfUrl = '/catalogos/KASAL-INVERSIONES.pdf';
}
