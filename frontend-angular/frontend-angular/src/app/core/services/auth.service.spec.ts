import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService - Comprehensive Testing Suite', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000/api/auth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify(); // Verificar que no hay peticiones HTTP pendientes
    localStorage.clear();
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

  // ===== CASO 1: LOGIN - PETICIÓN HTTP =====
  describe('Test Case 1: Login HTTP Request', () => {
    it('should send POST request to login endpoint', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = {
        token: 'fake-jwt-token-12345',
        usuario: { id: '1', email: 'test@example.com' }
      };

      service.login(credentials.email, credentials.password).subscribe();

      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      
      req.flush(mockResponse);
    });

    it('should return token on successful login', (done) => {
      const mockResponse = { token: 'test-token-xyz' };

      service.login('user@test.com', 'pass123').subscribe(response => {
        expect(response.token).toBe('test-token-xyz');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(mockResponse);
    });

    it('should handle login error', (done) => {
      const errorMessage = 'Credenciales incorrectas';

      service.login('wrong@test.com', 'wrongpass').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.error.msg).toBe(errorMessage);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush({ msg: errorMessage }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle network error on login', (done) => {
      service.login('test@test.com', 'pass').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.error(new ProgressEvent('Network error'));
    });
  });

  // ===== CASO 2: REGISTER - PETICIÓN HTTP =====
  describe('Test Case 2: Register HTTP Request', () => {
    it('should send POST request to register endpoint', () => {
      const userData = {
        nombre: 'Anthony',
        email: 'anthony@test.com',
        password: 'securepass123'
      };
      const mockResponse = {
        msg: 'Usuario registrado',
        userId: '123'
      };

      service.register(userData.nombre, userData.email, userData.password).subscribe();

      const req = httpMock.expectOne(`${API_URL}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      
      req.flush(mockResponse);
    });

    it('should return success message on successful registration', (done) => {
      const mockResponse = { msg: 'Usuario creado exitosamente' };

      service.register('Test User', 'test@test.com', 'pass123').subscribe(response => {
        expect(response.msg).toBe('Usuario creado exitosamente');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/register`);
      req.flush(mockResponse);
    });

    it('should handle registration error - email already exists', (done) => {
      const errorMessage = 'El email ya está registrado';

      service.register('Test', 'existing@test.com', 'pass').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.error.msg).toBe(errorMessage);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/register`);
      req.flush({ msg: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle network error on registration', (done) => {
      service.register('Test', 'test@test.com', 'pass').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/register`);
      req.error(new ProgressEvent('Network error'));
    });
  });

  // ===== CASO 3: GUARDAR TOKEN EN LOCALSTORAGE =====
  describe('Test Case 3: Save Token to LocalStorage', () => {
    it('should save token to localStorage', () => {
      const token = 'test-jwt-token-12345';
      
      service.guardarToken(token);
      
      const savedToken = localStorage.getItem('token');
      expect(savedToken).toBe(token);
    });

    it('should overwrite existing token', () => {
      localStorage.setItem('token', 'old-token');
      
      const newToken = 'new-token-67890';
      service.guardarToken(newToken);
      
      const savedToken = localStorage.getItem('token');
      expect(savedToken).toBe(newToken);
      expect(savedToken).not.toBe('old-token');
    });

    it('should save empty string as token', () => {
      service.guardarToken('');
      
      const savedToken = localStorage.getItem('token');
      expect(savedToken).toBe('');
    });

    it('should save long token string', () => {
      const longToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      service.guardarToken(longToken);
      
      const savedToken = localStorage.getItem('token');
      expect(savedToken).toBe(longToken);
    });
  });

  // ===== CASO 4: OBTENER TOKEN DE LOCALSTORAGE =====
  describe('Test Case 4: Get Token from LocalStorage', () => {
    it('should retrieve token from localStorage', () => {
      const token = 'stored-token-12345';
      localStorage.setItem('token', token);
      
      const retrievedToken = service.obtenerToken();
      
      expect(retrievedToken).toBe(token);
    });

    it('should return null when no token exists', () => {
      const retrievedToken = service.obtenerToken();
      
      expect(retrievedToken).toBeNull();
    });

    it('should return null after token is removed', () => {
      localStorage.setItem('token', 'temp-token');
      localStorage.removeItem('token');
      
      const retrievedToken = service.obtenerToken();
      
      expect(retrievedToken).toBeNull();
    });

    it('should retrieve empty string if empty token was saved', () => {
      localStorage.setItem('token', '');
      
      const retrievedToken = service.obtenerToken();
      
      expect(retrievedToken).toBe('');
    });
  });

  // ===== CASO 5: LOGOUT - ELIMINAR TOKEN =====
  describe('Test Case 5: Logout - Remove Token', () => {
    it('should remove token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      
      service.logout();
      
      const token = localStorage.getItem('token');
      expect(token).toBeNull();
    });

    it('should handle logout when no token exists', () => {
      service.logout();
      
      const token = localStorage.getItem('token');
      expect(token).toBeNull();
    });

    it('should only remove token, not other localStorage items', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('otherData', 'some-data');
      
      service.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('otherData')).toBe('some-data');
    });

    it('should allow multiple logout calls', () => {
      localStorage.setItem('token', 'test-token');
      
      service.logout();
      service.logout();
      service.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  // ===== CASO 6: FLUJO COMPLETO DE AUTENTICACIÓN =====
  describe('Test Case 6: Complete Authentication Flow', () => {
    it('should complete full login flow', (done) => {
      const credentials = { email: 'user@test.com', password: 'pass123' };
      const mockResponse = { token: 'auth-token-xyz' };

      service.login(credentials.email, credentials.password).subscribe(response => {
        service.guardarToken(response.token);
        
        const savedToken = service.obtenerToken();
        expect(savedToken).toBe('auth-token-xyz');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(mockResponse);
    });

    it('should complete full registration and login flow', (done) => {
      // Registro
      const registerData = { nombre: 'Test', email: 'test@test.com', password: 'pass' };
      const registerResponse = { msg: 'Usuario creado' };

      service.register(registerData.nombre, registerData.email, registerData.password).subscribe(() => {
        // Login después del registro
        const loginResponse = { token: 'new-user-token' };
        
        service.login(registerData.email, registerData.password).subscribe(response => {
          service.guardarToken(response.token);
          
          const token = service.obtenerToken();
          expect(token).toBe('new-user-token');
          done();
        });

        const loginReq = httpMock.expectOne(`${API_URL}/login`);
        loginReq.flush(loginResponse);
      });

      const registerReq = httpMock.expectOne(`${API_URL}/register`);
      registerReq.flush(registerResponse);
    });

    it('should complete login and logout flow', (done) => {
      const mockResponse = { token: 'temp-token' };

      service.login('user@test.com', 'pass').subscribe(response => {
        service.guardarToken(response.token);
        expect(service.obtenerToken()).toBe('temp-token');
        
        service.logout();
        expect(service.obtenerToken()).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(mockResponse);
    });
  });

  // ===== CASO 7: VALIDACIÓN DE DATOS =====
  describe('Test Case 7: Data Validation', () => {
    it('should send request with credentials in body', () => {
      service.login('test@test.com', 'pass').subscribe();

      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', password: 'pass' });
      
      req.flush({ token: 'token' });
    });

    it('should handle special characters in credentials', () => {
      const specialPassword = 'p@ssw0rd!#$%';
      
      service.login('test@test.com', specialPassword).subscribe();

      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.body.password).toBe(specialPassword);
      
      req.flush({ token: 'token' });
    });

    it('should handle unicode characters in nombre', () => {
      const unicodeName = 'José García Martínez';
      
      service.register(unicodeName, 'test@test.com', 'pass').subscribe();

      const req = httpMock.expectOne(`${API_URL}/register`);
      expect(req.request.body.nombre).toBe(unicodeName);
      
      req.flush({ msg: 'OK' });
    });
  });

  // ===== CASO 8: MANEJO DE ERRORES ESPECÍFICOS =====
  describe('Test Case 8: Specific Error Handling', () => {
    it('should handle 401 Unauthorized error', (done) => {
      service.login('test@test.com', 'wrongpass').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush({ msg: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 400 Bad Request error', (done) => {
      service.register('', 'invalid', '').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/register`);
      req.flush({ msg: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 500 Server Error', (done) => {
      service.login('test@test.com', 'pass').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush({ msg: 'Internal Server Error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ===== CASO 9: JASMINE MATCHERS Y VALIDACIONES =====
  describe('Test Case 9: Jasmine Matchers & Additional Validations', () => {
    it('should verify service methods are defined', () => {
      expect(service.login).toBeDefined();
      expect(service.register).toBeDefined();
      expect(service.guardarToken).toBeDefined();
      expect(service.obtenerToken).toBeDefined();
      expect(service.logout).toBeDefined();
    });

    it('should verify API URL contains correct path', () => {
      expect((service as any).API).toMatch(/\/api\/auth$/);
    });

    it('should verify token storage key', () => {
      service.guardarToken('test');
      const keys = Object.keys(localStorage);
      expect(keys).toContain('token');
    });

    it('should verify localStorage operations', () => {
      const testToken = 'verification-token';
      service.guardarToken(testToken);
      
      expect(localStorage.length).toBeGreaterThan(0);
      expect(service.obtenerToken()).toBeTruthy();
    });
  });

  // ===== CASO 10: MÚLTIPLES PETICIONES CONCURRENTES =====
  describe('Test Case 10: Concurrent Requests', () => {
    it('should handle multiple login requests', () => {
      service.login('user1@test.com', 'pass1').subscribe();
      service.login('user2@test.com', 'pass2').subscribe();

      const requests = httpMock.match(`${API_URL}/login`);
      expect(requests.length).toBe(2);
      
      requests[0].flush({ token: 'token1' });
      requests[1].flush({ token: 'token2' });
    });

    it('should handle multiple register requests', () => {
      service.register('User1', 'user1@test.com', 'pass1').subscribe();
      service.register('User2', 'user2@test.com', 'pass2').subscribe();

      const requests = httpMock.match(`${API_URL}/register`);
      expect(requests.length).toBe(2);
      
      requests[0].flush({ msg: 'OK' });
      requests[1].flush({ msg: 'OK' });
    });

    it('should handle mixed login and register requests', () => {
      service.login('user@test.com', 'pass').subscribe();
      service.register('New User', 'new@test.com', 'pass').subscribe();

      const loginReq = httpMock.expectOne(`${API_URL}/login`);
      const registerReq = httpMock.expectOne(`${API_URL}/register`);
      
      expect(loginReq.request.method).toBe('POST');
      expect(registerReq.request.method).toBe('POST');
      
      loginReq.flush({ token: 'token' });
      registerReq.flush({ msg: 'OK' });
    });
  });

  // ===== CASO 11: PERSISTENCIA DE TOKEN =====
  describe('Test Case 11: Token Persistence', () => {
    it('should persist token across service instances', () => {
      const token = 'persistent-token';
      service.guardarToken(token);
      
      // Simular nueva instancia del servicio
      const newService = TestBed.inject(AuthService);
      const retrievedToken = newService.obtenerToken();
      
      expect(retrievedToken).toBe(token);
    });

    it('should update token and retrieve new value', () => {
      service.guardarToken('old-token');
      expect(service.obtenerToken()).toBe('old-token');
      
      service.guardarToken('new-token');
      expect(service.obtenerToken()).toBe('new-token');
    });

    it('should clear token after logout', () => {
      service.guardarToken('token-to-clear');
      expect(service.obtenerToken()).toBeTruthy();
      
      service.logout();
      expect(service.obtenerToken()).toBeNull();
    });
  });

  // ===== CASO 12: VALIDACIÓN DE RESPUESTAS =====
  describe('Test Case 12: Response Validation', () => {
    it('should handle response with additional user data', (done) => {
      const mockResponse = {
        token: 'token-123',
        usuario: {
          id: '1',
          nombre: 'Test User',
          email: 'test@test.com'
        }
      };

      service.login('test@test.com', 'pass').subscribe(response => {
        expect(response.token).toBe('token-123');
        expect(response.usuario).toBeDefined();
        expect(response.usuario.email).toBe('test@test.com');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(mockResponse);
    });

    it('should handle minimal register response', (done) => {
      const mockResponse = { msg: 'OK' };

      service.register('Test', 'test@test.com', 'pass').subscribe(response => {
        expect(response.msg).toBe('OK');
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/register`);
      req.flush(mockResponse);
    });
  });
});
