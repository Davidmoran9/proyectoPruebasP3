import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LibroService } from './libro.service';

describe('LibroService - Comprehensive Testing Suite', () => {
  let service: LibroService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000/api/libros';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LibroService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(LibroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verificar que no hay peticiones HTTP pendientes
  });

  // ===== PRUEBAS BÁSICAS DE CREACIÓN =====
  describe('Basic Service Tests', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have correct API URL', () => {
      expect((service as any).API).toBe(API_URL);
    });

    it('should inject HttpClient', () => {
      expect((service as any).http).toBeTruthy();
    });
  });

  // ===== CASO 1: OBTENER LIBROS (GET ALL) =====
  describe('Test Case 1: Get All Books (obtenerLibros)', () => {
    it('should send GET request to libros endpoint', () => {
      service.obtenerLibros().subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      
      req.flush([]);
    });

    it('should return array of books', (done) => {
      const mockLibros = [
        { _id: '1', titulo: 'Don Quijote', autor: 'Cervantes' },
        { _id: '2', titulo: 'El Principito', autor: 'Saint-Exupéry' },
        { _id: '3', titulo: 'Cien años de soledad', autor: 'García Márquez' }
      ];

      service.obtenerLibros().subscribe(libros => {
        expect(libros.length).toBe(3);
        expect(libros).toEqual(mockLibros);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockLibros);
    });

    it('should return empty array when no books exist', (done) => {
      service.obtenerLibros().subscribe(libros => {
        expect(libros).toEqual([]);
        expect(libros.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush([]);
    });

    it('should handle error when fetching books fails', (done) => {
      service.obtenerLibros().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.error(new ProgressEvent('Network error'));
    });

    it('should handle 500 server error', (done) => {
      service.obtenerLibros().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ msg: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ===== CASO 2: CREAR LIBRO (POST) =====
  describe('Test Case 2: Create New Book (crearLibro)', () => {
    it('should send POST request to create book', () => {
      const nuevoLibro = { titulo: '1984', autor: 'George Orwell' };

      service.crearLibro(nuevoLibro).subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoLibro);
      
      req.flush({ ...nuevoLibro, _id: '123' });
    });

    it('should return created book with id', (done) => {
      const nuevoLibro = { titulo: 'El Señor de los Anillos', autor: 'Tolkien' };
      const mockResponse = { _id: '456', ...nuevoLibro };

      service.crearLibro(nuevoLibro).subscribe((libro: any) => {
        expect(libro._id).toBe('456');
        expect(libro.titulo).toBe('El Señor de los Anillos');
        expect(libro.autor).toBe('Tolkien');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockResponse);
    });

    it('should create book with special characters', (done) => {
      const libroConEspeciales = {
        titulo: 'Crónica de una muerte anunciada',
        autor: 'García Márquez'
      };

      service.crearLibro(libroConEspeciales).subscribe((libro: any) => {
        expect(libro.titulo).toContain('ó');
        expect(libro.autor).toContain('í');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ ...libroConEspeciales, _id: '789' });
    });

    it('should handle error when creating book fails', (done) => {
      const nuevoLibro = { titulo: 'Test', autor: 'Test' };

      service.crearLibro(nuevoLibro).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ msg: 'Error al crear libro' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should send request with book data in body', () => {
      const nuevoLibro = { titulo: 'Test', autor: 'Test' };

      service.crearLibro(nuevoLibro).subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoLibro);
      
      req.flush({});
    });
  });

  // ===== CASO 3: ACTUALIZAR LIBRO (PUT) =====
  describe('Test Case 3: Update Book (actualizarLibro)', () => {
    it('should send PUT request to update book', () => {
      const libroId = '123';
      const datosActualizados = { titulo: 'Título actualizado', autor: 'Autor actualizado' };

      service.actualizarLibro(libroId, datosActualizados).subscribe();

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(datosActualizados);
      
      req.flush({ _id: libroId, ...datosActualizados });
    });

    it('should return updated book data', (done) => {
      const libroId = '456';
      const datosActualizados = { titulo: 'Nuevo título', autor: 'Nuevo autor' };
      const mockResponse = { _id: libroId, ...datosActualizados };

      service.actualizarLibro(libroId, datosActualizados).subscribe((libro: any) => {
        expect(libro._id).toBe('456');
        expect(libro.titulo).toBe('Nuevo título');
        expect(libro.autor).toBe('Nuevo autor');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.flush(mockResponse);
    });

    it('should update only titulo', (done) => {
      const libroId = '789';
      const datosActualizados = { titulo: 'Solo título cambiado' };

      service.actualizarLibro(libroId, datosActualizados).subscribe((libro: any) => {
        expect(libro.titulo).toBe('Solo título cambiado');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.flush({ _id: libroId, ...datosActualizados, autor: 'Autor original' });
    });

    it('should update only autor', (done) => {
      const libroId = '321';
      const datosActualizados = { autor: 'Solo autor cambiado' };

      service.actualizarLibro(libroId, datosActualizados).subscribe((libro: any) => {
        expect(libro.autor).toBe('Solo autor cambiado');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.flush({ _id: libroId, titulo: 'Título original', ...datosActualizados });
    });

    it('should handle error when updating non-existent book', (done) => {
      const libroId = 'non-existent-id';
      const datosActualizados = { titulo: 'Test', autor: 'Test' };

      service.actualizarLibro(libroId, datosActualizados).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.flush({ msg: 'Libro no encontrado' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle network error during update', (done) => {
      const libroId = '123';
      const datosActualizados = { titulo: 'Test' };

      service.actualizarLibro(libroId, datosActualizados).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.error(new ProgressEvent('Network error'));
    });
  });

  // ===== CASO 4: ELIMINAR LIBRO (DELETE) =====
  describe('Test Case 4: Delete Book (eliminarLibro)', () => {
    it('should send DELETE request to remove book', () => {
      const libroId = '123';

      service.eliminarLibro(libroId).subscribe();

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      expect(req.request.method).toBe('DELETE');
      
      req.flush({ msg: 'Libro eliminado' });
    });

    it('should return success message on deletion', (done) => {
      const libroId = '456';
      const mockResponse = { msg: 'Libro eliminado exitosamente' };

      service.eliminarLibro(libroId).subscribe((response: any) => {
        expect(response.msg).toBe('Libro eliminado exitosamente');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.flush(mockResponse);
    });

    it('should handle error when deleting non-existent book', (done) => {
      const libroId = 'non-existent-id';

      service.eliminarLibro(libroId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.flush({ msg: 'Libro no encontrado' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle unauthorized deletion', (done) => {
      const libroId = '789';

      service.eliminarLibro(libroId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.flush({ msg: 'No autorizado' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle network error during deletion', (done) => {
      const libroId = '123';

      service.eliminarLibro(libroId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${libroId}`);
      req.error(new ProgressEvent('Network error'));
    });
  });

  // ===== CASO 5: FLUJO COMPLETO CRUD =====
  describe('Test Case 5: Complete CRUD Flow', () => {
    it('should create, read, update, and delete a book', (done) => {
      const nuevoLibro = { titulo: 'Test Book', autor: 'Test Author' };
      
      // CREATE
      service.crearLibro(nuevoLibro).subscribe((libroCreado: any) => {
        expect(libroCreado._id).toBe('new-id');
        
        // READ
        service.obtenerLibros().subscribe((libros: any) => {
          expect(libros.length).toBe(1);
          expect(libros[0].titulo).toBe('Test Book');
          
          // UPDATE
          service.actualizarLibro('new-id', { titulo: 'Updated Book' }).subscribe((libroActualizado: any) => {
            expect(libroActualizado.titulo).toBe('Updated Book');
            
            // DELETE
            service.eliminarLibro('new-id').subscribe(() => {
              done();
            });
            
            const deleteReq = httpMock.expectOne(`${API_URL}/new-id`);
            deleteReq.flush({ msg: 'Eliminado' });
          });
          
          const updateReq = httpMock.expectOne(`${API_URL}/new-id`);
          updateReq.flush({ _id: 'new-id', titulo: 'Updated Book', autor: 'Test Author' });
        });
        
        const readReq = httpMock.expectOne(API_URL);
        readReq.flush([{ _id: 'new-id', titulo: 'Test Book', autor: 'Test Author' }]);
      });
      
      const createReq = httpMock.expectOne(API_URL);
      createReq.flush({ _id: 'new-id', ...nuevoLibro });
    });
  });

  // ===== CASO 6: MÚLTIPLES OPERACIONES =====
  describe('Test Case 6: Multiple Operations', () => {
    it('should handle multiple GET requests', () => {
      service.obtenerLibros().subscribe();
      service.obtenerLibros().subscribe();

      const requests = httpMock.match(API_URL);
      expect(requests.length).toBe(2);
      
      requests[0].flush([]);
      requests[1].flush([]);
    });

    it('should handle multiple CREATE requests', () => {
      service.crearLibro({ titulo: 'Libro 1', autor: 'Autor 1' }).subscribe();
      service.crearLibro({ titulo: 'Libro 2', autor: 'Autor 2' }).subscribe();

      const requests = httpMock.match(API_URL);
      expect(requests.length).toBe(2);
      
      requests[0].flush({ _id: '1', titulo: 'Libro 1', autor: 'Autor 1' });
      requests[1].flush({ _id: '2', titulo: 'Libro 2', autor: 'Autor 2' });
    });

    it('should handle multiple DELETE requests', () => {
      service.eliminarLibro('1').subscribe();
      service.eliminarLibro('2').subscribe();

      const req1 = httpMock.expectOne(`${API_URL}/1`);
      const req2 = httpMock.expectOne(`${API_URL}/2`);
      
      expect(req1.request.method).toBe('DELETE');
      expect(req2.request.method).toBe('DELETE');
      
      req1.flush({ msg: 'OK' });
      req2.flush({ msg: 'OK' });
    });

    it('should handle mixed operations', () => {
      service.obtenerLibros().subscribe();
      service.crearLibro({ titulo: 'Nuevo', autor: 'Autor' }).subscribe();
      service.eliminarLibro('123').subscribe();

      const getReq = httpMock.expectOne(req => req.method === 'GET' && req.url === API_URL);
      const postReq = httpMock.expectOne(req => req.method === 'POST' && req.url === API_URL);
      const deleteReq = httpMock.expectOne(req => req.method === 'DELETE');
      
      expect(getReq.request.method).toBe('GET');
      expect(postReq.request.method).toBe('POST');
      expect(deleteReq.request.method).toBe('DELETE');
      
      getReq.flush([]);
      postReq.flush({ _id: '456', titulo: 'Nuevo', autor: 'Autor' });
      deleteReq.flush({ msg: 'OK' });
    });
  });

  // ===== CASO 7: VALIDACIÓN DE DATOS =====
  describe('Test Case 7: Data Validation', () => {
    it('should handle long titles and authors', (done) => {
      const libroConTextoLargo = {
        titulo: 'Este es un título muy largo que contiene muchas palabras para probar el sistema',
        autor: 'Este es un nombre de autor muy largo con múltiples apellidos'
      };

      service.crearLibro(libroConTextoLargo).subscribe((libro: any) => {
        expect(libro.titulo.length).toBeGreaterThan(50);
        expect(libro.autor.length).toBeGreaterThan(30);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ _id: '1', ...libroConTextoLargo });
    });

    it('should handle books with numbers in title', (done) => {
      const libro = { titulo: '1984', autor: 'George Orwell' };

      service.crearLibro(libro).subscribe((result: any) => {
        expect(result.titulo).toMatch(/\d+/);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ _id: '1', ...libro });
    });

    it('should handle empty strings', (done) => {
      const libroVacio = { titulo: '', autor: '' };

      service.crearLibro(libroVacio).subscribe((libro: any) => {
        expect(libro.titulo).toBe('');
        expect(libro.autor).toBe('');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ _id: '1', ...libroVacio });
    });
  });

  // ===== CASO 8: JASMINE MATCHERS Y VALIDACIONES =====
  describe('Test Case 8: Jasmine Matchers & Additional Validations', () => {
    it('should verify all service methods are defined', () => {
      expect(service.obtenerLibros).toBeDefined();
      expect(service.crearLibro).toBeDefined();
      expect(service.actualizarLibro).toBeDefined();
      expect(service.eliminarLibro).toBeDefined();
    });

    it('should verify API URL format', () => {
      expect((service as any).API).toMatch(/^http:\/\/localhost:\d+\/api\/libros$/);
      expect((service as any).API).toContain('/api/libros');
    });

    it('should verify book object structure', (done) => {
      const mockLibros = [
        { _id: '1', titulo: 'Test', autor: 'Author' }
      ];

      service.obtenerLibros().subscribe((libros: any) => {
        expect(libros[0]._id).toBeDefined();
        expect(libros[0].titulo).toBeDefined();
        expect(libros[0].autor).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockLibros);
    });

    it('should verify response types', (done) => {
      service.obtenerLibros().subscribe(libros => {
        expect(Array.isArray(libros)).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush([]);
    });
  });

  // ===== CASO 9: MANEJO DE IDs =====
  describe('Test Case 9: ID Handling', () => {
    it('should handle MongoDB ObjectId format', (done) => {
      const mongoId = '507f1f77bcf86cd799439011';
      
      service.eliminarLibro(mongoId).subscribe();

      const req = httpMock.expectOne(`${API_URL}/${mongoId}`);
      expect(req.request.url).toContain(mongoId);
      req.flush({ msg: 'OK' });
      done();
    });

    it('should handle numeric IDs as strings', (done) => {
      const numericId = '12345';
      
      service.actualizarLibro(numericId, { titulo: 'Test' }).subscribe();

      const req = httpMock.expectOne(`${API_URL}/${numericId}`);
      expect(req.request.url).toContain('12345');
      req.flush({ _id: numericId, titulo: 'Test' });
      done();
    });

    it('should handle UUID format IDs', (done) => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      
      service.eliminarLibro(uuidId).subscribe();

      const req = httpMock.expectOne(`${API_URL}/${uuidId}`);
      expect(req.request.url).toContain(uuidId);
      req.flush({ msg: 'OK' });
      done();
    });
  });

  // ===== CASO 10: RESPUESTAS CON DIFERENTES ESTRUCTURAS =====
  describe('Test Case 10: Different Response Structures', () => {
    it('should handle response with metadata', (done) => {
      const mockResponse = {
        data: [
          { _id: '1', titulo: 'Libro 1', autor: 'Autor 1' }
        ],
        total: 1,
        page: 1
      };

      service.obtenerLibros().subscribe(response => {
        expect(response).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockResponse);
    });

    it('should handle minimal book data', (done) => {
      const minimalLibro = { titulo: 'Solo titulo', autor: 'Solo autor' };

      service.crearLibro(minimalLibro).subscribe((libro: any) => {
        expect(libro.titulo).toBeTruthy();
        expect(libro.autor).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ ...minimalLibro, _id: '1' });
    });

    it('should handle book with additional fields', (done) => {
      const libroCompleto = {
        titulo: 'Test',
        autor: 'Author',
        isbn: '978-3-16-148410-0',
        anio: 2020,
        editorial: 'Test Editorial'
      };

      service.crearLibro(libroCompleto).subscribe((libro: any) => {
        expect(libro.titulo).toBeDefined();
        expect(libro.autor).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ ...libroCompleto, _id: '1' });
    });
  });
});
