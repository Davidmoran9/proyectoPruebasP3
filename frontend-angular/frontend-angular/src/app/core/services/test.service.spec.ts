import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestService } from './test.service';

describe('TestService - Comprehensive Testing Suite', () => {
  let service: TestService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000/api/libros';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TestService);
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

    it('should be provided in root', () => {
      const metadata = (TestService as any).ɵprov;
      expect(metadata.providedIn).toBe('root');
    });
  });

  // ===== CASO 1: TEST BACKEND - PETICIÓN GET =====
  describe('Test Case 1: Test Backend Connection (testBackend)', () => {
    it('should send GET request to backend', () => {
      service.testBackend().subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      
      req.flush([]);
    });

    it('should return data from backend', (done) => {
      const mockData = [
        { _id: '1', titulo: 'Libro Test 1', autor: 'Autor Test 1' },
        { _id: '2', titulo: 'Libro Test 2', autor: 'Autor Test 2' }
      ];

      service.testBackend().subscribe((data: any) => {
        expect(data).toEqual(mockData);
        expect(Array.isArray(data)).toBeTrue();
        expect(data.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockData);
    });

    it('should return empty array when no data exists', (done) => {
      service.testBackend().subscribe((data: any) => {
        expect(data).toEqual([]);
        expect(Array.isArray(data)).toBeTrue();
        expect(data.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush([]);
    });

    it('should handle successful response with large dataset', (done) => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        _id: `id-${i}`,
        titulo: `Libro ${i}`,
        autor: `Autor ${i}`
      }));

      service.testBackend().subscribe((data: any) => {
        expect(data.length).toBe(100);
        expect(data[0]._id).toBe('id-0');
        expect(data[99]._id).toBe('id-99');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(largeDataset);
    });
  });

  // ===== CASO 2: MANEJO DE ERRORES =====
  describe('Test Case 2: Error Handling', () => {
    it('should handle 404 error', (done) => {
      service.testBackend().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ msg: 'Endpoint not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', (done) => {
      service.testBackend().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(
        { msg: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle network error', (done) => {
      service.testBackend().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.error instanceof ProgressEvent).toBeTrue();
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.error(new ProgressEvent('Network error'));
    });

    it('should handle timeout error', (done) => {
      service.testBackend().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(408);
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ msg: 'Timeout' }, { status: 408, statusText: 'Request Timeout' });
    });

    it('should handle unauthorized error (401)', (done) => {
      service.testBackend().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush({ msg: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ===== CASO 3: MÚLTIPLES LLAMADAS =====
  describe('Test Case 3: Multiple Backend Calls', () => {
    it('should handle multiple sequential calls', () => {
      service.testBackend().subscribe();
      service.testBackend().subscribe();

      const requests = httpMock.match(API_URL);
      expect(requests.length).toBe(2);
      
      requests[0].flush([{ _id: '1', titulo: 'Test 1', autor: 'Autor 1' }]);
      requests[1].flush([{ _id: '2', titulo: 'Test 2', autor: 'Autor 2' }]);
    });

    it('should handle concurrent requests', () => {
      const subscription1 = service.testBackend().subscribe();
      const subscription2 = service.testBackend().subscribe();
      const subscription3 = service.testBackend().subscribe();

      const requests = httpMock.match(API_URL);
      expect(requests.length).toBe(3);
      
      requests.forEach((req, index) => {
        req.flush([{ _id: `${index}`, titulo: `Book ${index}`, autor: `Author ${index}` }]);
      });
    });

    it('should allow multiple calls with different responses', (done) => {
      let callCount = 0;

      service.testBackend().subscribe((data: any) => {
        callCount++;
        expect(data.length).toBe(1);
        
        if (callCount === 2) {
          done();
        }
      });

      service.testBackend().subscribe((data: any) => {
        callCount++;
        expect(data.length).toBe(2);
        
        if (callCount === 2) {
          done();
        }
      });

      const requests = httpMock.match(API_URL);
      requests[0].flush([{ _id: '1', titulo: 'Book 1', autor: 'Author 1' }]);
      requests[1].flush([
        { _id: '1', titulo: 'Book 1', autor: 'Author 1' },
        { _id: '2', titulo: 'Book 2', autor: 'Author 2' }
      ]);
    });
  });

  // ===== CASO 4: VALIDACIÓN DE RESPUESTAS =====
  describe('Test Case 4: Response Validation', () => {
    it('should verify response contains book objects', (done) => {
      const mockBooks = [
        { _id: '1', titulo: 'Book 1', autor: 'Author 1' }
      ];

      service.testBackend().subscribe((data: any) => {
        expect(data[0]._id).toBeDefined();
        expect(data[0].titulo).toBeDefined();
        expect(data[0].autor).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockBooks);
    });

    it('should handle response with additional fields', (done) => {
      const mockBooksWithExtras = [
        {
          _id: '1',
          titulo: 'Book 1',
          autor: 'Author 1',
          isbn: '978-3-16-148410-0',
          anio: 2020,
          editorial: 'Test Editorial'
        }
      ];

      service.testBackend().subscribe((data: any) => {
        expect(data[0].isbn).toBe('978-3-16-148410-0');
        expect(data[0].anio).toBe(2020);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockBooksWithExtras);
    });

    it('should handle response with metadata', (done) => {
      const responseWithMeta = {
        data: [{ _id: '1', titulo: 'Book 1', autor: 'Author 1' }],
        total: 1,
        page: 1,
        totalPages: 1
      };

      service.testBackend().subscribe(data => {
        expect(data).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(responseWithMeta);
    });
  });

  // ===== CASO 5: JASMINE MATCHERS Y VALIDACIONES =====
  describe('Test Case 5: Jasmine Matchers & Additional Validations', () => {
    it('should verify testBackend method is defined', () => {
      expect(service.testBackend).toBeDefined();
      expect(typeof service.testBackend).toBe('function');
    });

    it('should verify API URL format', () => {
      expect((service as any).API).toMatch(/^http:\/\/localhost:\d+\/api\/libros$/);
      expect((service as any).API).toContain('/api/libros');
      expect((service as any).API).toContain('localhost');
    });

    it('should verify response is array type', (done) => {
      service.testBackend().subscribe(data => {
        expect(Array.isArray(data)).toBeTrue();
        expect(data).toBeInstanceOf(Array);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush([]);
    });

    it('should verify data length matches response', (done) => {
      const mockData = [
        { _id: '1', titulo: 'Book 1', autor: 'Author 1' },
        { _id: '2', titulo: 'Book 2', autor: 'Author 2' },
        { _id: '3', titulo: 'Book 3', autor: 'Author 3' }
      ];

      service.testBackend().subscribe((data: any) => {
        expect(data.length).toBe(3);
        expect(data.length).toBeGreaterThan(0);
        expect(data.length).toBeLessThan(10);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockData);
    });
  });

  // ===== CASO 6: TESTING DE CONECTIVIDAD =====
  describe('Test Case 6: Connectivity Testing', () => {
    it('should test backend availability', (done) => {
      service.testBackend().subscribe({
        next: (data) => {
          expect(data).toBeDefined();
          done();
        },
        error: () => fail('Backend should be available')
      });

      const req = httpMock.expectOne(API_URL);
      req.flush([]);
    });

    it('should verify correct endpoint is called', () => {
      service.testBackend().subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.url).toBe('http://localhost:3000/api/libros');
      expect(req.request.method).toBe('GET');
      
      req.flush([]);
    });

    it('should not send any body in GET request', () => {
      service.testBackend().subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.body).toBeNull();
      
      req.flush([]);
    });
  });

  // ===== CASO 7: DIFERENTES TIPOS DE DATOS =====
  describe('Test Case 7: Different Data Types', () => {
    it('should handle books with special characters', (done) => {
      const booksWithSpecialChars = [
        { _id: '1', titulo: 'Crónica de una muerte anunciada', autor: 'García Márquez' },
        { _id: '2', titulo: 'L\'Étranger', autor: 'Albert Camus' }
      ];

      service.testBackend().subscribe((data: any) => {
        expect(data[0].titulo).toContain('ó');
        expect(data[0].autor).toContain('í');
        expect(data[1].titulo).toContain('\'');
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(booksWithSpecialChars);
    });

    it('should handle books with long text', (done) => {
      const booksWithLongText = [
        {
          _id: '1',
          titulo: 'Este es un título extremadamente largo que podría contener muchas palabras y caracteres',
          autor: 'Este es un nombre de autor muy largo con múltiples apellidos y títulos'
        }
      ];

      service.testBackend().subscribe((data: any) => {
        expect(data[0].titulo.length).toBeGreaterThan(50);
        expect(data[0].autor.length).toBeGreaterThan(30);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(booksWithLongText);
    });

    it('should handle books with numbers in fields', (done) => {
      const booksWithNumbers = [
        { _id: '1', titulo: '1984', autor: 'George Orwell' },
        { _id: '2', titulo: 'Fahrenheit 451', autor: 'Ray Bradbury' }
      ];

      service.testBackend().subscribe((data: any) => {
        expect(data[0].titulo).toMatch(/\d+/);
        expect(data[1].titulo).toMatch(/\d+/);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(booksWithNumbers);
    });
  });

  // ===== CASO 8: ESTADO DEL SERVICIO =====
  describe('Test Case 8: Service State', () => {
    it('should maintain same API URL across calls', () => {
      const api1 = (service as any).API;
      service.testBackend().subscribe();
      httpMock.expectOne(API_URL).flush([]);
      
      const api2 = (service as any).API;
      service.testBackend().subscribe();
      httpMock.expectOne(API_URL).flush([]);
      
      expect(api1).toBe(api2);
    });

    it('should be singleton service', () => {
      const service1 = TestBed.inject(TestService);
      const service2 = TestBed.inject(TestService);
      
      expect(service1).toBe(service2);
    });
  });

  // ===== CASO 9: CASOS EDGE (LÍMITES) =====
  describe('Test Case 9: Edge Cases', () => {
    it('should handle null response', (done) => {
      service.testBackend().subscribe(data => {
        expect(data).toBeNull();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(null);
    });

    it('should handle null response', (done) => {
      service.testBackend().subscribe((data: any) => {
        expect(data).toBeNull();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(null);
    });

    it('should handle very large response', (done) => {
      const largeResponse = Array.from({ length: 1000 }, (_, i) => ({
        _id: `id-${i}`,
        titulo: `Libro ${i}`,
        autor: `Autor ${i}`
      }));

      service.testBackend().subscribe((data: any) => {
        expect(data.length).toBe(1000);
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(largeResponse);
    });
  });

  // ===== CASO 10: VERIFICACIÓN DE HTTP CLIENT =====
  describe('Test Case 10: HTTP Client Verification', () => {
    it('should use injected HttpClient', () => {
      const httpClient = (service as any).http;
      expect(httpClient).toBeTruthy();
      expect(httpClient.get).toBeDefined();
    });

    it('should make HTTP request through HttpClient', () => {
      spyOn((service as any).http, 'get').and.callThrough();
      
      service.testBackend().subscribe();
      
      expect((service as any).http.get).toHaveBeenCalledWith(API_URL);
      
      const req = httpMock.expectOne(API_URL);
      req.flush([]);
    });
  });
});
