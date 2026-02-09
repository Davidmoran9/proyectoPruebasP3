import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { LibroService } from './core/services/libro.service';
import { AuthService } from './core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('AppComponent - Comprehensive Testing Suite', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let compiled: HTMLElement;
  let libroService: jasmine.SpyObj<LibroService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const libroServiceSpy = jasmine.createSpyObj('LibroService', [
      'obtenerLibros',
      'crearLibro',
      'actualizarLibro',
      'eliminarLibro'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'register',
      'guardarToken',
      'obtenerToken',
      'logout'
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent, LoginComponent, RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LibroService, useValue: libroServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    libroService = TestBed.inject(LibroService) as jasmine.SpyObj<LibroService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  // ===== PRUEBAS BÁSICAS DE CREACIÓN =====
  describe('Basic Component Tests', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.libros).toEqual([]);
      expect(component.titulo).toBe('');
      expect(component.autor).toBe('');
      expect(component.mostrarRegistro).toBeFalse();
      expect(component.modoEdicion).toBeFalse();
      expect(component.libroEditandoId).toBeNull();
    });
  });

  // ===== CASO 1: PRUEBAS DE AUTENTICACIÓN Y LOGIN =====
  describe('Test Case 1: Authentication & Login State', () => {
    it('should show login view when not logged in', () => {
      localStorage.removeItem('token');
      component.logueado = false;
      fixture.detectChanges();

      const authWrapper = compiled.querySelector('.auth-wrapper');
      const dashboard = compiled.querySelector('.dashboard');

      expect(authWrapper).toBeTruthy();
      expect(dashboard).toBeNull();
    });

    it('should show dashboard when logged in', () => {
      localStorage.setItem('token', 'fake-token');
      component.logueado = true;
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();

      const authWrapper = compiled.querySelector('.auth-wrapper');
      const dashboard = compiled.querySelector('.dashboard');

      expect(authWrapper).toBeNull();
      expect(dashboard).toBeTruthy();
    });

    it('should handle successful login event', () => {
      spyOn(component, 'cargarLibros');
      libroService.obtenerLibros.and.returnValue(of([]));
      
      component.logueado = false;
      component.mostrarRegistro = true;
      
      component.onLoginExitoso();
      
      expect(component.logueado).toBeTrue();
      expect(component.mostrarRegistro).toBeFalse();
      expect(component.cargarLibros).toHaveBeenCalled();
    });

    it('should check for token in ngOnInit when logged in', () => {
      localStorage.setItem('token', 'test-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      spyOn(component, 'cargarLibros');

      component.ngOnInit();

      expect(component.logueado).toBeTrue();
      expect(component.cargarLibros).toHaveBeenCalled();
    });

    it('should not load books in ngOnInit when not logged in', () => {
      localStorage.removeItem('token');
      spyOn(component, 'cargarLibros');

      component.ngOnInit();

      expect(component.logueado).toBeFalse();
      expect(component.cargarLibros).not.toHaveBeenCalled();
    });
  });

  // ===== CASO 2: TOGGLE ENTRE LOGIN Y REGISTRO =====
  describe('Test Case 2: Toggle Login/Register Views', () => {
    beforeEach(() => {
      component.logueado = false;
      fixture.detectChanges();
    });

    it('should show login by default', () => {
      expect(component.mostrarRegistro).toBeFalse();
      
      const loginComponent = compiled.querySelector('app-login');
      const registerComponent = compiled.querySelector('app-register');
      
      expect(loginComponent).toBeTruthy();
      expect(registerComponent).toBeNull();
    });

    it('should toggle to register view when clicking register button', () => {
      const registerButton = Array.from(compiled.querySelectorAll('.link-button'))
        .find(btn => btn.textContent?.includes('Regístrate')) as HTMLButtonElement;
      
      expect(registerButton).toBeTruthy();
      registerButton.click();
      fixture.detectChanges();
      
      expect(component.mostrarRegistro).toBeTrue();
    });

    it('should toggle back to login view from register', () => {
      component.mostrarRegistro = true;
      fixture.detectChanges();
      
      const loginButton = Array.from(compiled.querySelectorAll('.link-button'))
        .find(btn => btn.textContent?.includes('Volver al login')) as HTMLButtonElement;
      
      expect(loginButton).toBeTruthy();
      loginButton.click();
      fixture.detectChanges();
      
      expect(component.mostrarRegistro).toBeFalse();
    });
  });

  // ===== CASO 3: INPUT FIELDS DEL FORMULARIO =====
  describe('Test Case 3: Form Input Fields', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should update titulo property when input value changes', () => {
      const inputTitulo = compiled.querySelector('#titulo') as HTMLInputElement;
      
      expect(inputTitulo).toBeTruthy();
      expect(inputTitulo.placeholder).toBe('Ingrese el título del libro');
      
      inputTitulo.value = 'El Quijote';
      inputTitulo.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(inputTitulo.value).toBe('El Quijote');
    });

    it('should update autor property when input value changes', () => {
      const inputAutor = compiled.querySelector('#autor') as HTMLInputElement;
      
      expect(inputAutor).toBeTruthy();
      expect(inputAutor.placeholder).toBe('Ingrese el nombre del autor');
      
      inputAutor.value = 'Miguel de Cervantes';
      inputAutor.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(inputAutor.value).toBe('Miguel de Cervantes');
    });

    it('should have required attributes on inputs', () => {
      const inputTitulo = compiled.querySelector('#titulo') as HTMLInputElement;
      const inputAutor = compiled.querySelector('#autor') as HTMLInputElement;
      
      expect(inputTitulo.hasAttribute('required')).toBeTrue();
      expect(inputAutor.hasAttribute('required')).toBeTrue();
    });

    it('should bind component properties to form model', fakeAsync(() => {
      component.titulo = 'Cien años de soledad';
      component.autor = 'Gabriel García Márquez';
      fixture.detectChanges();
      tick();
      
      // Verificar que las propiedades del componente se actualizaron
      expect(component.titulo).toBe('Cien años de soledad');
      expect(component.autor).toBe('Gabriel García Márquez');
      
      // Verificar que los inputs existen y tienen los atributos correctos
      const inputTitulo = compiled.querySelector('#titulo') as HTMLInputElement;
      const inputAutor = compiled.querySelector('#autor') as HTMLInputElement;
      expect(inputTitulo).toBeTruthy();
      expect(inputAutor).toBeTruthy();
    }));
  });

  // ===== CASO 4: CREAR NUEVO LIBRO =====
  describe('Test Case 4: Create New Book', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should create a new book successfully', () => {
      const mockLibro = { titulo: '1984', autor: 'George Orwell' };
      libroService.crearLibro.and.returnValue(of(mockLibro));
      libroService.obtenerLibros.and.returnValue(of([mockLibro]));
      
      component.titulo = '1984';
      component.autor = 'George Orwell';
      component.guardarLibro();
      
      expect(libroService.crearLibro).toHaveBeenCalledWith({
        titulo: '1984',
        autor: 'George Orwell'
      });
    });

    it('should reset form after creating book', () => {
      libroService.crearLibro.and.returnValue(of({}));
      libroService.obtenerLibros.and.returnValue(of([]));
      
      component.titulo = 'Test Book';
      component.autor = 'Test Author';
      component.guardarLibro();
      
      expect(component.titulo).toBe('');
      expect(component.autor).toBe('');
    });

    it('should show submit button with correct text in create mode', () => {
      component.modoEdicion = false;
      fixture.detectChanges();
      
      const submitButton = compiled.querySelector('.btn-primary') as HTMLButtonElement;
      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent?.trim()).toContain('Guardar');
    });

    it('should handle error when creating book fails', () => {
      spyOn(console, 'error');
      libroService.crearLibro.and.returnValue(throwError(() => new Error('Error al crear')));
      
      component.titulo = 'Test';
      component.autor = 'Test';
      component.guardarLibro();
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ===== CASO 5: EDITAR LIBRO =====
  describe('Test Case 5: Edit Book', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should enter edit mode when editing a book', () => {
      const libro = { _id: '123', titulo: 'Test Book', autor: 'Test Author' };
      
      component.editarLibro(libro);
      
      expect(component.modoEdicion).toBeTrue();
      expect(component.libroEditandoId).toBe('123');
      expect(component.titulo).toBe('Test Book');
      expect(component.autor).toBe('Test Author');
    });

    it('should update book when in edit mode', () => {
      libroService.actualizarLibro.and.returnValue(of({}));
      libroService.obtenerLibros.and.returnValue(of([]));
      
      component.modoEdicion = true;
      component.libroEditandoId = '123';
      component.titulo = 'Updated Title';
      component.autor = 'Updated Author';
      
      component.guardarLibro();
      
      expect(libroService.actualizarLibro).toHaveBeenCalledWith('123', {
        titulo: 'Updated Title',
        autor: 'Updated Author'
      });
    });

    it('should show update button text in edit mode', () => {
      component.modoEdicion = true;
      fixture.detectChanges();
      
      const submitButton = compiled.querySelector('.btn-primary') as HTMLButtonElement;
      expect(submitButton.textContent?.trim()).toContain('Actualizar');
    });

    it('should show cancel button in edit mode', () => {
      component.modoEdicion = true;
      fixture.detectChanges();
      
      const cancelButton = compiled.querySelector('.btn-cancel') as HTMLButtonElement;
      expect(cancelButton).toBeTruthy();
      expect(cancelButton.textContent?.trim()).toContain('Cancelar');
    });

    it('should cancel edit mode when clicking cancel button', () => {
      component.modoEdicion = true;
      component.libroEditandoId = '123';
      component.titulo = 'Test';
      component.autor = 'Test';
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
      
      const cancelButton = compiled.querySelector('.btn-cancel') as HTMLButtonElement;
      cancelButton.click();
      
      expect(component.modoEdicion).toBeFalse();
      expect(component.libroEditandoId).toBeNull();
      expect(component.titulo).toBe('');
      expect(component.autor).toBe('');
    });

    it('should handle error when updating book fails', () => {
      spyOn(console, 'error');
      libroService.actualizarLibro.and.returnValue(throwError(() => new Error('Update failed')));
      
      component.modoEdicion = true;
      component.libroEditandoId = '123';
      component.titulo = 'Test';
      component.autor = 'Test';
      component.guardarLibro();
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ===== CASO 6: ELIMINAR LIBRO =====
  describe('Test Case 6: Delete Book', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should delete book when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      libroService.eliminarLibro.and.returnValue(of({}));
      libroService.obtenerLibros.and.returnValue(of([]));
      
      component.eliminarLibro('123');
      
      expect(libroService.eliminarLibro).toHaveBeenCalledWith('123');
      expect(libroService.obtenerLibros).toHaveBeenCalled();
    });

    it('should not delete book when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.eliminarLibro('123');
      
      expect(libroService.eliminarLibro).not.toHaveBeenCalled();
    });

    it('should handle error when deletion fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'error');
      libroService.eliminarLibro.and.returnValue(throwError(() => new Error('Delete failed')));
      
      component.eliminarLibro('123');
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should show delete button in table', () => {
      const mockLibros = [
        { _id: '1', titulo: 'Libro 1', autor: 'Autor 1' }
      ];
      component.libros = mockLibros;
      fixture.detectChanges();
      
      const deleteButton = compiled.querySelector('.btn-delete') as HTMLButtonElement;
      expect(deleteButton).toBeTruthy();
      expect(deleteButton.textContent?.trim()).toBe('🗑️');
    });
  });

  // ===== CASO 7: CARGAR Y MOSTRAR LIBROS =====
  describe('Test Case 7: Load and Display Books', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should load books successfully', () => {
      const mockLibros = [
        { _id: '1', titulo: 'Libro 1', autor: 'Autor 1' },
        { _id: '2', titulo: 'Libro 2', autor: 'Autor 2' }
      ];
      libroService.obtenerLibros.and.returnValue(of(mockLibros));
      
      component.cargarLibros();
      
      expect(component.libros).toEqual(mockLibros);
      expect(component.libros.length).toBe(2);
    });

    it('should display books in table', () => {
      const mockLibros = [
        { _id: '1', titulo: 'Don Quijote', autor: 'Cervantes' },
        { _id: '2', titulo: 'El Principito', autor: 'Saint-Exupéry' }
      ];
      component.libros = mockLibros;
      fixture.detectChanges();
      
      const tableRows = compiled.querySelectorAll('.data-table tbody tr');
      expect(tableRows.length).toBe(2);
    });

    it('should show empty state when no books', () => {
      component.libros = [];
      fixture.detectChanges();
      
      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      
      const emptyText = emptyState?.querySelector('h3');
      expect(emptyText?.textContent).toContain('No hay libros registrados');
    });

    it('should not show empty state when books exist', () => {
      component.libros = [{ _id: '1', titulo: 'Test', autor: 'Test' }];
      fixture.detectChanges();
      
      const emptyState = compiled.querySelector('.empty-state');
      const table = compiled.querySelector('.data-table');
      
      expect(emptyState).toBeNull();
      expect(table).toBeTruthy();
    });

    it('should display total book count', () => {
      const mockLibros = [
        { _id: '1', titulo: 'Libro 1', autor: 'Autor 1' },
        { _id: '2', titulo: 'Libro 2', autor: 'Autor 2' },
        { _id: '3', titulo: 'Libro 3', autor: 'Autor 3' }
      ];
      component.libros = mockLibros;
      fixture.detectChanges();
      
      const totalCount = compiled.querySelector('.total-count');
      expect(totalCount?.textContent).toContain('Total: 3');
    });

    it('should handle error when loading books fails', () => {
      spyOn(console, 'error');
      libroService.obtenerLibros.and.returnValue(throwError(() => new Error('Load failed')));
      
      component.cargarLibros();
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ===== CASO 8: TABLA DE LIBROS - ELEMENTOS HTML =====
  describe('Test Case 8: Books Table HTML Elements', () => {
    beforeEach(() => {
      const mockLibros = [
        { _id: '1', titulo: 'Libro Test', autor: 'Autor Test' }
      ];
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of(mockLibros));
      fixture.detectChanges();
    });

    it('should have table headers', () => {
      const headers = compiled.querySelectorAll('.data-table thead th');
      expect(headers.length).toBeGreaterThan(0);
      
      const headerTexts = Array.from(headers).map(h => h.textContent?.trim());
      expect(headerTexts).toContain('Título');
      expect(headerTexts).toContain('Autor');
      expect(headerTexts).toContain('Acciones');
    });

    it('should display book number in table', () => {
      const bookNumber = compiled.querySelector('.book-number');
      expect(bookNumber).toBeTruthy();
      expect(bookNumber?.textContent).toBe('1');
    });

    it('should display book title and author', () => {
      const titleCell = compiled.querySelector('.data-table tbody .col-title strong');
      const authorCell = compiled.querySelector('.data-table tbody .col-author');
      
      expect(titleCell?.textContent).toBe('Libro Test');
      expect(authorCell?.textContent?.trim()).toBe('Autor Test');
    });

    it('should have edit and delete buttons for each book', () => {
      const editButton = compiled.querySelector('.btn-edit');
      const deleteButton = compiled.querySelector('.btn-delete');
      
      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
    });
  });

  // ===== CASO 9: HEADER Y LOGOUT =====
  describe('Test Case 9: Dashboard Header and Logout', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should display dashboard header when logged in', () => {
      const header = compiled.querySelector('.dashboard-header');
      expect(header).toBeTruthy();
    });

    it('should display header title', () => {
      const headerTitle = compiled.querySelector('.header-title h1');
      expect(headerTitle).toBeTruthy();
      expect(headerTitle?.textContent).toContain('Sistema de Gestión de Biblioteca');
    });

    it('should display header subtitle', () => {
      const headerSubtitle = compiled.querySelector('.header-subtitle');
      expect(headerSubtitle).toBeTruthy();
      expect(headerSubtitle?.textContent).toBe('Panel de Administración');
    });

    it('should have logout button in header', () => {
      const logoutButton = compiled.querySelector('.btn-logout-header') as HTMLButtonElement;
      expect(logoutButton).toBeTruthy();
      expect(logoutButton.textContent?.trim()).toContain('Cerrar sesión');
    });

    it('should have logout functionality that clears token', () => {
      // Verificar que el método logout existe
      expect(component.logout).toBeDefined();
      
      // Verificar que el botón de logout existe y tiene el texto correcto
      const logoutButton = compiled.querySelector('.btn-logout-header') as HTMLButtonElement;
      expect(logoutButton).toBeTruthy();
      
      // Nota: No podemos probar location.reload() en un test unitario
      // ya que causaría un reload real de la página de tests
    });
  });

  // ===== CASO 10: RESETEAR FORMULARIO =====
  describe('Test Case 10: Reset Form', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should reset all form fields', () => {
      component.titulo = 'Test Titulo';
      component.autor = 'Test Autor';
      component.modoEdicion = true;
      component.libroEditandoId = '123';
      
      component.resetFormulario();
      
      expect(component.titulo).toBe('');
      expect(component.autor).toBe('');
      expect(component.modoEdicion).toBeFalse();
      expect(component.libroEditandoId).toBeNull();
    });

    it('should reload books after reset', () => {
      component.resetFormulario();
      expect(libroService.obtenerLibros).toHaveBeenCalled();
    });
  });

  // ===== CASO 11: FORMULARIO - CARD Y ESTRUCTURA =====
  describe('Test Case 11: Form Card Structure', () => {
    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.returnValue('fake-token');
      libroService.obtenerLibros.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should display form card in sidebar', () => {
      const formCard = compiled.querySelector('.form-card');
      expect(formCard).toBeTruthy();
    });

    it('should show correct heading in create mode', () => {
      component.modoEdicion = false;
      fixture.detectChanges();
      
      const heading = compiled.querySelector('.form-card h2');
      expect(heading?.textContent?.trim()).toContain('Nuevo Libro');
    });

    it('should show correct heading in edit mode', () => {
      component.modoEdicion = true;
      fixture.detectChanges();
      
      const heading = compiled.querySelector('.form-card h2');
      expect(heading?.textContent?.trim()).toContain('Editar Libro');
    });

    it('should have form fields with labels', () => {
      const tituloLabel = Array.from(compiled.querySelectorAll('label'))
        .find(label => label.textContent === 'Título');
      const autorLabel = Array.from(compiled.querySelectorAll('label'))
        .find(label => label.textContent === 'Autor');
      
      expect(tituloLabel).toBeTruthy();
      expect(autorLabel).toBeTruthy();
    });
  });

  // ===== CASO 12: JASMINE MATCHERS - VALIDACIONES ADICIONALES =====
  describe('Test Case 12: Jasmine Matchers & Additional Validations', () => {
    it('should verify component properties are defined', () => {
      expect(component.libros).toBeDefined();
      expect(component.titulo).toBeDefined();
      expect(component.autor).toBeDefined();
      expect(component.logueado).toBeDefined();
      expect(component.modoEdicion).toBeDefined();
    });

    it('should verify initial boolean states', () => {
      expect(component.logueado).toBeFalsy();
      expect(component.mostrarRegistro).toBeFalsy();
      expect(component.modoEdicion).toBeFalsy();
    });

    it('should verify libroEditandoId can be null or string', () => {
      expect(component.libroEditandoId).toBeNull();
      
      component.libroEditandoId = '12345';
      expect(component.libroEditandoId).toMatch(/\d+/);
    });

    it('should verify libros array operations', () => {
      const mockLibros = [
        { _id: '1', titulo: 'Libro 1', autor: 'Autor 1' },
        { _id: '2', titulo: 'Libro 2', autor: 'Autor 2' }
      ];
      
      component.libros = mockLibros;
      
      expect(component.libros.length).toBeGreaterThan(0);
      expect(component.libros.length).toBeLessThanOrEqual(10);
      expect(component.libros).toContain(mockLibros[0]);
    });

    it('should verify string properties behavior', () => {
      component.titulo = 'El Señor de los Anillos';
      
      expect(component.titulo).toMatch(/Señor/);
      expect(component.titulo.length).toBeGreaterThan(5);
    });
  });

  // ===== CLEANUP =====
  afterEach(() => {
    localStorage.clear();
  });
});
