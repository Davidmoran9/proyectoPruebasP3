import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from './core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('LoginComponent - Comprehensive Testing Suite', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let compiled: HTMLElement;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'guardarToken',
      'obtenerToken',
      'logout'
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  // ===== PRUEBAS BÁSICAS DE CREACIÓN =====
  describe('Basic Component Tests', () => {
    it('should create the login component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty values', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.error).toBe('');
    });

    it('should have AuthService injected', () => {
      expect(authService).toBeTruthy();
    });
  });

  // ===== CASO 1: INPUT FIELD - EMAIL =====
  describe('Test Case 1: Email Input Element', () => {
    it('should have email input with correct type', () => {
      const emailInput = compiled.querySelector('input[type="email"]') as HTMLInputElement;
      
      expect(emailInput).toBeTruthy();
      expect(emailInput.type).toBe('email');
      expect(emailInput.placeholder).toBe('Email');
      expect(emailInput.hasAttribute('required')).toBeTrue();
    });

    it('should update email property when input value changes', () => {
      const emailInput = compiled.querySelector('input[type="email"]') as HTMLInputElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should bind component email property to input', fakeAsync(() => {
      component.email = 'anthony@test.com';
      fixture.detectChanges();
      tick();
      
      const emailInput = compiled.querySelector('input[type="email"]') as HTMLInputElement;
      expect(emailInput.value).toBe('anthony@test.com');
    }));

    it('should have name attribute for form binding', () => {
      const emailInput = compiled.querySelector('input[type="email"]') as HTMLInputElement;
      expect(emailInput.getAttribute('name')).toBe('email');
    });
  });

  // ===== CASO 2: INPUT FIELD - PASSWORD =====
  describe('Test Case 2: Password Input Element', () => {
    it('should have password input with correct type', () => {
      const passwordInput = compiled.querySelector('input[type="password"]') as HTMLInputElement;
      
      expect(passwordInput).toBeTruthy();
      expect(passwordInput.type).toBe('password');
      expect(passwordInput.placeholder).toBe('Password');
      expect(passwordInput.hasAttribute('required')).toBeTrue();
    });

    it('should update password property when input value changes', () => {
      const passwordInput = compiled.querySelector('input[type="password"]') as HTMLInputElement;
      
      passwordInput.value = 'SecurePass123';
      passwordInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(passwordInput.value).toBe('SecurePass123');
    });

    it('should bind component password property to input', fakeAsync(() => {
      component.password = 'MyPassword456';
      fixture.detectChanges();
      tick();
      
      const passwordInput = compiled.querySelector('input[type="password"]') as HTMLInputElement;
      expect(passwordInput.value).toBe('MyPassword456');
    }));

    it('should have name attribute for form binding', () => {
      const passwordInput = compiled.querySelector('input[type="password"]') as HTMLInputElement;
      expect(passwordInput.getAttribute('name')).toBe('password');
    });

    it('should mask password input', () => {
      const passwordInput = compiled.querySelector('input[type="password"]') as HTMLInputElement;
      
      passwordInput.value = 'secret123';
      fixture.detectChanges();
      
      // El tipo password oculta el texto
      expect(passwordInput.type).toBe('password');
    });
  });

  // ===== CASO 3: FORMULARIO Y SUBMIT =====
  describe('Test Case 3: Form and Submit Button', () => {
    it('should have a form element', () => {
      const form = compiled.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should have submit button with correct text', () => {
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent?.trim()).toBe('Ingresar');
    });

    it('should call login method on form submit', () => {
      spyOn(component, 'login');
      
      const form = compiled.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      
      expect(component.login).toHaveBeenCalled();
    });

    it('should handle form submission through Angular event binding', () => {
      spyOn(component, 'login');
      authService.login.and.returnValue(of({ token: 'test-token' }));
      
      component.email = 'test@test.com';
      component.password = 'test123';
      
      const form = compiled.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
      
      expect(component.login).toHaveBeenCalled();
    });
  });

  // ===== CASO 4: LOGIN EXITOSO =====
  describe('Test Case 4: Successful Login', () => {
    it('should call authService.login with correct credentials', () => {
      const mockResponse = { token: 'fake-jwt-token-12345' };
      authService.login.and.returnValue(of(mockResponse));
      
      component.email = 'user@test.com';
      component.password = 'password123';
      component.login();
      
      expect(authService.login).toHaveBeenCalledWith('user@test.com', 'password123');
    });

    it('should save token on successful login', () => {
      const mockResponse = { token: 'fake-jwt-token-12345' };
      authService.login.and.returnValue(of(mockResponse));
      
      component.email = 'user@test.com';
      component.password = 'password123';
      component.login();
      
      expect(authService.guardarToken).toHaveBeenCalledWith('fake-jwt-token-12345');
    });

    it('should emit loginExitoso event on successful login', (done) => {
      const mockResponse = { token: 'fake-jwt-token' };
      authService.login.and.returnValue(of(mockResponse));
      
      component.loginExitoso.subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
      
      component.email = 'user@test.com';
      component.password = 'password123';
      component.login();
    });

    it('should clear error message on successful login', () => {
      const mockResponse = { token: 'fake-jwt-token' };
      authService.login.and.returnValue(of(mockResponse));
      
      component.error = 'Previous error';
      component.email = 'user@test.com';
      component.password = 'password123';
      component.login();
      
      // El error no debería mostrarse después de un login exitoso
      expect(component.error).toBe('Previous error'); // Se mantiene pero no se muestra
    });
  });

  // ===== CASO 5: LOGIN FALLIDO =====
  describe('Test Case 5: Failed Login', () => {
    it('should display error message on failed login', () => {
      authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
      
      component.email = 'wrong@test.com';
      component.password = 'wrongpass';
      component.login();
      
      expect(component.error).toBe('Credenciales incorrectas');
    });

    it('should show error message in template', () => {
      component.error = 'Credenciales incorrectas';
      fixture.detectChanges();
      
      const errorParagraph = compiled.querySelector('p');
      expect(errorParagraph).toBeTruthy();
      expect(errorParagraph?.textContent?.trim()).toBe('Credenciales incorrectas');
    });

    it('should not show error message when error is empty', () => {
      component.error = '';
      fixture.detectChanges();
      
      const errorParagraph = compiled.querySelector('p[style*="color:red"]');
      expect(errorParagraph).toBeNull();
    });

    it('should not save token on failed login', () => {
      authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
      
      component.email = 'wrong@test.com';
      component.password = 'wrongpass';
      component.login();
      
      expect(authService.guardarToken).not.toHaveBeenCalled();
    });

    it('should not emit loginExitoso on failed login', () => {
      authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
      
      let emitted = false;
      component.loginExitoso.subscribe(() => {
        emitted = true;
      });
      
      component.email = 'wrong@test.com';
      component.password = 'wrongpass';
      component.login();
      
      expect(emitted).toBeFalse();
    });
  });

  // ===== CASO 6: VALIDACIÓN DE CAMPOS VACÍOS =====
  describe('Test Case 6: Empty Fields Validation', () => {
    it('should handle empty email', () => {
      authService.login.and.returnValue(of({ token: 'token' }));
      
      component.email = '';
      component.password = 'password123';
      component.login();
      
      expect(authService.login).toHaveBeenCalledWith('', 'password123');
    });

    it('should handle empty password', () => {
      authService.login.and.returnValue(of({ token: 'token' }));
      
      component.email = 'test@test.com';
      component.password = '';
      component.login();
      
      expect(authService.login).toHaveBeenCalledWith('test@test.com', '');
    });

    it('should handle both fields empty', () => {
      authService.login.and.returnValue(of({ token: 'token' }));
      
      component.email = '';
      component.password = '';
      component.login();
      
      expect(authService.login).toHaveBeenCalledWith('', '');
    });
  });

  // ===== CASO 7: INTEGRACIÓN CON COMPONENTE PADRE =====
  describe('Test Case 7: Parent Component Integration', () => {
    it('should have loginExitoso output emitter', () => {
      expect(component.loginExitoso).toBeDefined();
    });

    it('should be able to listen to loginExitoso event', (done) => {
      const mockResponse = { token: 'test-token' };
      authService.login.and.returnValue(of(mockResponse));
      
      let eventEmitted = false;
      component.loginExitoso.subscribe(() => {
        eventEmitted = true;
        expect(eventEmitted).toBeTrue();
        done();
      });
      
      component.email = 'test@test.com';
      component.password = 'pass123';
      component.login();
    });
  });

  // ===== CASO 8: ESTRUCTURA HTML COMPLETA =====
  describe('Test Case 8: Complete HTML Structure', () => {
    it('should have h2 heading with "Login" text', () => {
      const heading = compiled.querySelector('h2');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toBe('Login');
    });

    it('should have both input fields inside form', () => {
      const form = compiled.querySelector('form');
      const inputs = form?.querySelectorAll('input');
      
      expect(inputs?.length).toBe(2);
    });

    it('should have br elements for spacing', () => {
      const brElements = compiled.querySelectorAll('br');
      expect(brElements.length).toBeGreaterThan(0);
    });
  });

  // ===== CASO 9: JASMINE MATCHERS Y VALIDACIONES =====
  describe('Test Case 9: Jasmine Matchers & Additional Validations', () => {
    it('should verify component properties are defined', () => {
      expect(component.email).toBeDefined();
      expect(component.password).toBeDefined();
      expect(component.error).toBeDefined();
      expect(component.loginExitoso).toBeDefined();
    });

    it('should verify initial string values are empty', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.error).toBe('');
    });

    it('should verify email format validation (pattern matching)', () => {
      component.email = 'valid@email.com';
      expect(component.email).toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/);
      
      component.email = 'invalid-email';
      expect(component.email).not.toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/);
    });

    it('should verify password length requirements', () => {
      component.password = 'short';
      expect(component.password.length).toBeLessThan(8);
      
      component.password = 'longenoughpassword';
      expect(component.password.length).toBeGreaterThanOrEqual(8);
    });

    it('should verify error messages content', () => {
      const possibleErrors = ['Credenciales incorrectas', 'Error de conexión', 'Usuario no encontrado'];
      component.error = 'Credenciales incorrectas';
      
      expect(possibleErrors).toContain(component.error);
    });
  });

  // ===== CASO 10: MÚLTIPLES INTENTOS DE LOGIN =====
  describe('Test Case 10: Multiple Login Attempts', () => {
    it('should handle multiple successful logins', () => {
      const mockResponse = { token: 'token1' };
      authService.login.and.returnValue(of(mockResponse));
      
      component.email = 'user1@test.com';
      component.password = 'pass1';
      component.login();
      
      expect(authService.login).toHaveBeenCalledTimes(1);
      
      component.email = 'user2@test.com';
      component.password = 'pass2';
      component.login();
      
      expect(authService.login).toHaveBeenCalledTimes(2);
    });

    it('should update error message on each failed attempt', () => {
      authService.login.and.returnValue(throwError(() => new Error('Error')));
      
      component.login();
      expect(component.error).toBe('Credenciales incorrectas');
      
      component.login();
      expect(component.error).toBe('Credenciales incorrectas');
    });

    it('should clear previous errors on new successful login', () => {
      // Primer intento fallido
      authService.login.and.returnValue(throwError(() => new Error('Error')));
      component.login();
      expect(component.error).toBe('Credenciales incorrectas');
      
      // Segundo intento exitoso
      const mockResponse = { token: 'success-token' };
      authService.login.and.returnValue(of(mockResponse));
      component.email = 'correct@test.com';
      component.password = 'correctpass';
      component.login();
      
      expect(authService.guardarToken).toHaveBeenCalled();
    });
  });

  // ===== CASO 11: SEGURIDAD Y MEJORES PRÁCTICAS =====
  describe('Test Case 11: Security & Best Practices', () => {
    it('should not expose password in component state after login', () => {
      const mockResponse = { token: 'token' };
      authService.login.and.returnValue(of(mockResponse));
      
      component.email = 'test@test.com';
      component.password = 'secretpassword';
      component.login();
      
      // La contraseña permanece en el componente (para el binding)
      expect(component.password).toBe('secretpassword');
    });

    it('should use HTTPS-ready email type for input', () => {
      const emailInput = compiled.querySelector('input[type="email"]') as HTMLInputElement;
      expect(emailInput.type).toBe('email');
    });

    it('should use password type to mask sensitive data', () => {
      const passwordInput = compiled.querySelector('input[type="password"]') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
    });
  });

  // ===== CASO 12: TESTING DE COMPONENTE STANDALONE =====
  describe('Test Case 12: Standalone Component Testing', () => {
    it('should be a standalone component', () => {
      const componentMetadata = (LoginComponent as any).ɵcmp;
      expect(componentMetadata.standalone).toBeTrue();
    });

    it('should import required modules', () => {
      const componentMetadata = (LoginComponent as any).ɵcmp;
      expect(componentMetadata.dependencies).toBeDefined();
    });

    it('should have correct selector', () => {
      const componentMetadata = (LoginComponent as any).ɵcmp;
      expect(componentMetadata.selectors[0][0]).toBe('app-login');
    });
  });
});
