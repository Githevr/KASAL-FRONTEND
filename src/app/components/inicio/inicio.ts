  import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {

  // Carrusel publicitario de la página de inicio.
  banners = [
    {
      imagen: 'images/banners/banner-bo2.jpeg',
      alt: 'Botas de seguridad industrial'
    },
    {
      imagen: 'images/banners/NITRON.png',
      alt: 'Cascos de seguridad industrial'
    },
    {
      imagen: 'images/banners/ALPINE.png',
      alt: 'Lentes de protección industrial'
    },
    {
      imagen: 'images/banners/mascarilla-kn95.png',
      alt: 'Equipos industriales'
    },
    {
      imagen: 'images/banners/tapones.png',
      alt: 'Mascarillas de protección'
    }

    
  ];

  bannerActual = 0;

  constructor(
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(
      'KASAL INVERSIONES SAC | Guantes Industriales y EPP en Perú'
    );

    this.metaService.updateTag({
      name: 'description',
      content: 'KASAL INVERSIONES SAC ofrece guantes industriales y equipos de protección personal (EPP) en Perú. Explora nuestro catálogo y solicita una cotización.'
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow'
    });
  }

  siguienteBanner(): void {
    this.bannerActual = (this.bannerActual + 1) % this.banners.length;
  }

  anteriorBanner(): void {
    this.bannerActual =
      (this.bannerActual - 1 + this.banners.length) % this.banners.length;
  }

  seleccionarBanner(indice: number): void {
    this.bannerActual = indice;
  }
}
