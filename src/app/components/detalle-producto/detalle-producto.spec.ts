  import { ComponentFixture, TestBed } from '@angular/core/testing';

  import { DetalleProductoComponent } from './detalle-producto';

  describe('DetalleProducto', () => {
    let component: DetalleProductoComponent;
    let fixture: ComponentFixture<DetalleProductoComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DetalleProductoComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(DetalleProductoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
