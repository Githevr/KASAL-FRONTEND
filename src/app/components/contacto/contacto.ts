import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class ContactoComponent {
  empresa: string = '';
  telefono: string = '';
  mensaje: string = '';

  enviarConsulta(): void {
    const texto = `*CONSULTA CORPORATIVA - KASAL INVERSIONES SAC*\n` +
                  `Empresa: ${this.empresa}\n` +
                  `Teléfono: ${this.telefono}\n` +
                  `Requerimiento: ${this.mensaje}`;

    const url = `https://wa.me/51981327368?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }
}