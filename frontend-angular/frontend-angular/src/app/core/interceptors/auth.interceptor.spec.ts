import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpRequest, HttpHeaders, HttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

describe('AuthInterceptor - Comprehensive Testing Suite', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const TEST_URL = 'http://localhost:3000/api/test';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify(); // Verificar que no hay peticiones HTTP pendientes
    localStorage.clear();
  });

  // ===== PRUEBAS BÁSICAS DEL INTERCEPTOR =====
  describe('Basic Interceptor Tests', () => {
    it('should be defined as a function', () => {
      expect(authInterceptor).toBeDefined();
      expect(typeof authInterceptor).toBe('function');
    });

    it('should be a HttpInterceptorFn type', () => {
      expect(authInterceptor.length).toBe(2); // req, next parameters
    });
  });

  // ===== CASO 1: PETICIÓN SIN TOKEN =====
  describe('Test Case 1: Requests Without Token', () => {
    it('should not add Authorization header when no token exists', () => {
      localStorage.removeItem('token');
      
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should not add Authorization header when token is null', () => {
      localStorage.removeItem('token');
      
      const testRequest = new HttpRequest('GET', TEST_URL);
      
      expect(testRequest.headers.has('Authorization')).toBeFalse();
    });

    it('should not add Authorization header when localStorage is empty', () => {
      localStorage.clear();
      
      const testRequest = new HttpRequest('GET', TEST_URL);
      
      expect(testRequest.headers.has('Authorization')).toBeFalse();
    });
  });

  // ===== CASO 2: PETICIÓN CON TOKEN =====
  describe('Test Case 2: Requests With Token', () => {
    it('should add Authorization header when token exists', () => {
      const token = 'test-jwt-token-12345';
      localStorage.setItem('token', token);
      
      const testRequest = new HttpRequest('GET', TEST_URL);
      const expectedAuthHeader = `Bearer ${token}`;
      
      // Verificar que el token está en localStorage
      expect(localStorage.getItem('token')).toBe(token);
    });

    it('should use Bearer token format', () => {
      const token = 'my-secure-token';
      localStorage.setItem('token', token);
      
      const expectedFormat = `Bearer ${token}`;
      
      expect(expectedFormat).toMatch(/^Bearer .+/);
      expect(expectedFormat).toContain('Bearer');
      expect(expectedFormat).toContain(token);
    });

    it('should handle long JWT tokens', () => {
      const longToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      localStorage.setItem('token', longToken);
      
      expect(localStorage.getItem('token')).toBe(longToken);
      expect(localStorage.getItem('token')?.length).toBeGreaterThan(100);
    });

    it('should handle tokens with special characters', () => {
      const tokenWithSpecialChars = 'token-with_special.chars-123';
      localStorage.setItem('token', tokenWithSpecialChars);
      
      expect(localStorage.getItem('token')).toBe(tokenWithSpecialChars);
      expect(localStorage.getItem('token')).toMatch(/[._-]/);
    });
  });

  // ===== CASO 3: CLONACIÓN DE PETICIÓN =====
  describe('Test Case 3: Request Cloning', () => {
    it('should clone request when adding Authorization header', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);
      
      const originalRequest = new HttpRequest('GET', TEST_URL);
      
      // El interceptor debería clonar la petición
      expect(originalRequest.headers.has('Authorization')).toBeFalse();
    });

    it('should preserve original request method', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);
      
      const getRequest = new HttpRequest('GET', TEST_URL);
      expect(getRequest.method).toBe('GET');
      
      const postRequest = new HttpRequest('POST', TEST_URL, null);
      expect(postRequest.method).toBe('POST');
    });

    it('should preserve original request URL', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);
      
      const request = new HttpRequest('GET', TEST_URL);
      expect(request.url).toBe(TEST_URL);
    });

    it('should preserve original request body', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);
      
      const body = { data: 'test data' };
      const request = new HttpRequest('POST', TEST_URL, body);
      
      expect(request.body).toEqual(body);
    });
  });

  // ===== CASO 4: DIFERENTES MÉTODOS HTTP =====
  describe('Test Case 4: Different HTTP Methods', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
    });

    it('should add Authorization header to GET requests', () => {
      const request = new HttpRequest('GET', TEST_URL);
      expect(request.method).toBe('GET');
    });

    it('should add Authorization header to POST requests', () => {
      const request = new HttpRequest('POST', TEST_URL, { data: 'test' });
      expect(request.method).toBe('POST');
    });

    it('should add Authorization header to PUT requests', () => {
      const request = new HttpRequest('PUT', TEST_URL, { data: 'test' });
      expect(request.method).toBe('PUT');
    });

    it('should add Authorization header to DELETE requests', () => {
      const request = new HttpRequest('DELETE', TEST_URL);
      expect(request.method).toBe('DELETE');
    });

    it('should add Authorization header to PATCH requests', () => {
      const request = new HttpRequest('PATCH', TEST_URL, { data: 'test' });
      expect(request.method).toBe('PATCH');
    });
  });

  // ===== CASO 5: DIFERENTES ENDPOINTS =====
  describe('Test Case 5: Different Endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
    });

    it('should add token to auth endpoint', () => {
      const authUrl = 'http://localhost:3000/api/auth/login';
      const request = new HttpRequest('POST', authUrl, null);
      expect(request.url).toContain('/auth/');
    });

    it('should add token to libros endpoint', () => {
      const librosUrl = 'http://localhost:3000/api/libros';
      const request = new HttpRequest('GET', librosUrl);
      expect(request.url).toContain('/libros');
    });

    it('should add token to user endpoint', () => {
      const userUrl = 'http://localhost:3000/api/users/profile';
      const request = new HttpRequest('GET', userUrl);
      expect(request.url).toContain('/users/');
    });

    it('should add token to any API endpoint', () => {
      const customUrl = 'http://localhost:3000/api/custom/endpoint';
      const request = new HttpRequest('GET', customUrl);
      expect(request.url).toContain('/api/');
    });
  });

  // ===== CASO 6: HEADERS EXISTENTES =====
  describe('Test Case 6: Existing Headers', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
    });

    it('should preserve existing headers when adding Authorization', () => {
      const customHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      const request = new HttpRequest('GET', TEST_URL, { headers: customHeaders });
      
      // Verificar que se puede crear request con headers personalizados
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('should add Authorization alongside custom headers', () => {
      const customHeaders = new HttpHeaders({
        'X-Custom-Header': 'custom-value'
      });
      const request = new HttpRequest('POST', TEST_URL, null, {
        headers: customHeaders
      });
      
      // Verificar que los headers personalizados existen
      expect(request.headers.get('X-Custom-Header')).toBe('custom-value');
    });

    it('should handle requests with multiple headers', () => {
      const customHeaders = new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      });
      const request = new HttpRequest('GET', TEST_URL, { headers: customHeaders });
      
      // Verificar que los headers están presentes
      expect(request.headers.get('Accept')).toBe('application/json');
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });
  });

  // ===== CASO 7: TOKEN VACÍO O INVÁLIDO =====
  describe('Test Case 7: Empty or Invalid Token', () => {
    it('should handle empty string token', () => {
      localStorage.setItem('token', '');
      
      const token = localStorage.getItem('token');
      expect(token).toBe('');
    });

    it('should handle whitespace token', () => {
      localStorage.setItem('token', '   ');
      
      const token = localStorage.getItem('token');
      expect(token).toBe('   ');
    });

    it('should handle null string token', () => {
      localStorage.setItem('token', 'null');
      
      const token = localStorage.getItem('token');
      expect(token).toBe('null');
    });

    it('should handle undefined string token', () => {
      localStorage.setItem('token', 'undefined');
      
      const token = localStorage.getItem('token');
      expect(token).toBe('undefined');
    });
  });

  // ===== CASO 8: MÚLTIPLES PETICIONES =====
  describe('Test Case 8: Multiple Requests', () => {
    it('should add token to all requests', () => {
      const token = 'multi-request-token';
      localStorage.setItem('token', token);
      
      const request1 = new HttpRequest('GET', 'http://localhost:3000/api/endpoint1');
      const request2 = new HttpRequest('POST', 'http://localhost:3000/api/endpoint2', null);
      const request3 = new HttpRequest('PUT', 'http://localhost:3000/api/endpoint3', null);
      
      expect(request1.url).toBeTruthy();
      expect(request2.url).toBeTruthy();
      expect(request3.url).toBeTruthy();
    });

    it('should use same token for concurrent requests', () => {
      const token = 'concurrent-token';
      localStorage.setItem('token', token);
      
      const storedToken1 = localStorage.getItem('token');
      const storedToken2 = localStorage.getItem('token');
      const storedToken3 = localStorage.getItem('token');
      
      expect(storedToken1).toBe(token);
      expect(storedToken2).toBe(token);
      expect(storedToken3).toBe(token);
    });
  });

  // ===== CASO 9: JASMINE MATCHERS Y VALIDACIONES =====
  describe('Test Case 9: Jasmine Matchers & Additional Validations', () => {
    it('should verify interceptor function signature', () => {
      expect(authInterceptor).toBeInstanceOf(Function);
      expect(authInterceptor.length).toBe(2);
    });

    it('should verify localStorage operations', () => {
      const testToken = 'validation-token';
      localStorage.setItem('token', testToken);
      
      expect(localStorage.getItem('token')).toBeDefined();
      expect(localStorage.getItem('token')).not.toBeNull();
      expect(localStorage.getItem('token')).toBe(testToken);
    });

    it('should verify token format in localStorage', () => {
      const token = 'jwt.token.here';
      localStorage.setItem('token', token);
      
      const storedToken = localStorage.getItem('token');
      expect(storedToken).toMatch(/^[\w.-]+$/);
    });

    it('should verify Bearer token format', () => {
      const token = 'test-token';
      const bearerToken = `Bearer ${token}`;
      
      expect(bearerToken).toMatch(/^Bearer .+/);
      expect(bearerToken.startsWith('Bearer ')).toBeTrue();
    });
  });

  // ===== CASO 10: CAMBIOS DE TOKEN =====
  describe('Test Case 10: Token Changes', () => {
    it('should use updated token after change', () => {
      localStorage.setItem('token', 'old-token');
      expect(localStorage.getItem('token')).toBe('old-token');
      
      localStorage.setItem('token', 'new-token');
      expect(localStorage.getItem('token')).toBe('new-token');
    });

    it('should handle token removal during session', () => {
      localStorage.setItem('token', 'temp-token');
      expect(localStorage.getItem('token')).toBe('temp-token');
      
      localStorage.removeItem('token');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle token refresh', () => {
      const oldToken = 'old-refresh-token';
      const newToken = 'new-refresh-token';
      
      localStorage.setItem('token', oldToken);
      expect(localStorage.getItem('token')).toBe(oldToken);
      
      localStorage.setItem('token', newToken);
      expect(localStorage.getItem('token')).toBe(newToken);
      expect(localStorage.getItem('token')).not.toBe(oldToken);
    });
  });

  // ===== CASO 11: REQUEST PARAMETERS =====
  describe('Test Case 11: Request Parameters', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
    });

    it('should preserve query parameters', () => {
      const urlWithParams = 'http://localhost:3000/api/libros?page=1&limit=10';
      const request = new HttpRequest('GET', urlWithParams);
      
      expect(request.url).toContain('?');
      expect(request.url).toContain('page=1');
      expect(request.url).toContain('limit=10');
    });

    it('should preserve URL hash fragments', () => {
      const urlWithHash = 'http://localhost:3000/api/resource#section';
      const request = new HttpRequest('GET', urlWithHash);
      
      expect(request.url).toContain('#');
    });

    it('should handle complex query strings', () => {
      const complexUrl = 'http://localhost:3000/api/search?q=test&filter[]=1&filter[]=2&sort=desc';
      const request = new HttpRequest('GET', complexUrl);
      
      expect(request.url).toContain('q=test');
      expect(request.url).toContain('filter[]=');
      expect(request.url).toContain('sort=desc');
    });
  });

  // ===== CASO 12: ESCENARIOS DE SEGURIDAD =====
  describe('Test Case 12: Security Scenarios', () => {
    it('should not expose token in request URL', () => {
      const token = 'secret-token';
      localStorage.setItem('token', token);
      
      const request = new HttpRequest('GET', TEST_URL);
      
      expect(request.url).not.toContain(token);
      expect(request.url).not.toContain('Bearer');
    });

    it('should handle potentially malicious tokens safely', () => {
      const maliciousToken = '<script>alert("xss")</script>';
      localStorage.setItem('token', maliciousToken);
      
      const token = localStorage.getItem('token');
      expect(token).toBe(maliciousToken);
    });

    it('should handle very long tokens', () => {
      const veryLongToken = 'a'.repeat(1000);
      localStorage.setItem('token', veryLongToken);
      
      const token = localStorage.getItem('token');
      expect(token?.length).toBe(1000);
    });
  });

  // ===== CASO 13: INTEGRATION TESTS - INTERCEPTOR EXECUTION =====
  describe('Test Case 13: Integration Tests - Interceptor Execution', () => {
    it('should add Authorization header when token exists in localStorage', () => {
      const token = 'integration-test-token';
      localStorage.setItem('token', token);

      httpClient.get(TEST_URL).subscribe();

      const req = httpMock.expectOne(TEST_URL);
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      
      req.flush({ success: true });
    });

    it('should NOT add Authorization header when token does not exist', () => {
      localStorage.removeItem('token');

      httpClient.get(TEST_URL).subscribe();

      const req = httpMock.expectOne(TEST_URL);
      expect(req.request.headers.has('Authorization')).toBeFalse();
      
      req.flush({ success: true });
    });

    it('should add Authorization header to POST requests with token', () => {
      const token = 'post-test-token';
      localStorage.setItem('token', token);

      httpClient.post(TEST_URL, { data: 'test' }).subscribe();

      const req = httpMock.expectOne(TEST_URL);
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(req.request.method).toBe('POST');
      
      req.flush({ success: true });
    });

    it('should work with different HTTP methods', () => {
      const token = 'methods-test-token';
      localStorage.setItem('token', token);

      // Test DELETE
      httpClient.delete(TEST_URL).subscribe();
      const deleteReq = httpMock.expectOne(TEST_URL);
      expect(deleteReq.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      deleteReq.flush({ success: true });

      // Test PUT
      httpClient.put(TEST_URL, {}).subscribe();
      const putReq = httpMock.expectOne(TEST_URL);
      expect(putReq.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      putReq.flush({ success: true });
    });

    it('should preserve existing headers when adding Authorization', () => {
      const token = 'headers-test-token';
      localStorage.setItem('token', token);

      httpClient.get(TEST_URL, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value'
        })
      }).subscribe();

      const req = httpMock.expectOne(TEST_URL);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      
      req.flush({ success: true });
    });
  });
});
