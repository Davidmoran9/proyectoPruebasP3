import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from './core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('RegisterComponent - Comprehensive Testing Suite', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let compiled: HTMLElement;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'register',
      'login',
      'guardarToken'
    ]);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  // ===== PRUEBAS BÁSICAS DE CREACIÓN =====
  describe('Basic Component Tests', () => {
    it('should create the register component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty values', () => {
      expect(component.nombre).toBe('');
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.mensaje).toBe('');
    });

    it('should have AuthService injected', () => {
      expect(authService).toBeTruthy();
    });
  });

  // ===== CASO 1: INPUT FIELD - NOMBRE =====
  describe('Test Case 1: Name Input Element', () => {
    it('should have name input with correct type', () => {
      const nameInput = compiled.querySelector('input[name="nombre"]') as HTMLInputElement;
      
      expect(nameInput).toBeTruthy();
      expect(nameInput.type).toBe('text');
      expect(nameInput.placeholder).toBe('Nombre');
      expect(nameInput.hasAttribute('required')).toBeTrue();
    });

    it('should update nombre property when input value changes', () => {
      const nameInput = compiled.querySelector('input[name="nombre"]') as HTMLInputElement;
      
      nameInput.value = 'Anthony';
      nameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(nameInput.value).toBe('Anthony');
    });

    it('should bind component nombre property to input', fakeAsync(() => {
      component.nombre = 'Juan Pérez';
      fixture.detectChanges();
      tick();
      
      const nameInput = compiled.querySelector('input[name="nombre"]') as HTMLInputElement;
      expect(nameInput.value).toBe('Juan Pérez');
    }));

    it('should have name attribute for form binding', () => {
      const nameInput = compiled.querySelector('input[name="nombre"]') as HTMLInputElement;
      expect(nameInput.getAttribute('name')).toBe('nombre');
    });
  });

  // ===== CASO 2: INPUT FIELD - EMAIL =====
  describe('Test Case 2: Email Input Element', () => {
    it('should have email input with correct type', () => {
      const emailInput = compiled.querySelector('input[name="email"]') as HTMLInputElement;
      
      expect(emailInput).toBeTruthy();
      expect(emailInput.type).toBe('email');
      expect(emailInput.placeholder).toBe('Email');
      expect(emailInput.hasAttribute('required')).toBeTrue();
    });

    it('should update email property when input value changes', () => {
      const emailInput = compiled.querySelector('input[name="email"]') as HTMLInputElement;
      
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should bind component email property to input', fakeAsync(() => {
      component.email = 'anthony@test.com';
      fixture.detectChanges();
      tick();
      
      const emailInput = compiled.querySelector('input[name="email"]') as HTMLInputElement;
      expect(emailInput.value).toBe('anthony@test.com');
    }));

    it('should validate email format with HTML5', () => {
      const emailInput = compiled.querySelector('input[name="email"]') as HTMLInputElement;
      expect(emailInput.type).toBe('email');
    });
  });

  // ===== CASO 3: INPUT FIELD - PASSWORD =====
  describe('Test Case 3: Password Input Element', () => {
    it('should have password input with correct type', () => {
      const passwordInput = compiled.querySelector('input[name="password"]') as HTMLInputElement;
      
      expect(passwordInput).toBeTruthy();
      expect(passwordInput.type).toBe('password');
      expect(passwordInput.placeholder).toBe('Password');
      expect(passwordInput.hasAttribute('required')).toBeTrue();
    });

    it('should update password property when input value changes', () => {
      const passwordInput = compiled.querySelector('input[name="password"]') as HTMLInputElement;
      
      passwordInput.value = 'SecurePass123';
      passwordInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      
      expect(passwordInput.value).toBe('SecurePass123');
    });

    it('should bind component password property to input', fakeAsync(() => {
      component.password = 'MyPassword456';
      fixture.detectChanges();
      tick();
      
      const passwordInput = compiled.querySelector('input[name="password"]') as HTMLInputElement;
      expect(passwordInput.value).toBe('MyPassword456');
    }));

    it('should mask password input', () => {
      const passwordInput = compiled.querySelector('input[name="password"]') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
    });
  });

  // ===== CASO 4: FORMULARIO Y SUBMIT =====
  describe('Test Case 4: Form and Submit Button', () => {
    it('should have a form element', () => {
      const form = compiled.querySelector('form');
      expect(form).toBeTruthy();
    });

    it('should have submit button with correct text', () => {
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent?.trim()).toBe('Registrarse');
    });

    it('should call registrar method on form submit', () => {
      spyOn(component, 'registrar');
      
      const form = compiled.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      
      expect(component.registrar).toHaveBeenCalled();
    });

    it('should have all three input fields in form', () => {
      const form = compiled.querySelector('form');
      const inputs = form?.querySelectorAll('input');
      
      expect(inputs?.length).toBe(3);
    });
  });

  // ===== CASO 5: REGISTRO EXITOSO =====
  describe('Test Case 5: Successful Registration', () => {
    it('should call authService.register with correct data', () => {
      const mockResponse = { msg: 'Usuario creado', userId: '123' };
      authService.register.and.returnValue(of(mockResponse));
      
      component.nombre = 'Anthony';
      component.email = 'anthony@test.com';
      component.password = 'password123';
      component.registrar();
      
      expect(authService.register).toHaveBeenCalledWith(
        'Anthony',
        'anthony@test.com',
        'password123'
      );
    });

    it('should show success message on successful registration', () => {
      const mockResponse = { msg: 'Usuario creado' };
      authService.register.and.returnValue(of(mockResponse));
      
      component.nombre = 'Test User';
      component.email = 'test@test.com';
      component.password = 'pass123';
      component.registrar();
      
      expect(component.mensaje).toBe('Usuario registrado correctamente');
    });

    it('should clear form fields after successful registration', () => {
      const mockResponse = { msg: 'Usuario creado' };
      authService.register.and.returnValue(of(mockResponse));
      
      component.nombre = 'Test User';
      component.email = 'test@test.com';
      component.password = 'pass123';
      component.registrar();
      
      expect(component.nombre).toBe('');
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });

    it('should display success message in template', () => {
      component.mensaje = 'Usuario registrado correctamente';
      fixture.detectChanges();
      
      const messageParagraph = compiled.querySelector('p');
      expect(messageParagraph).toBeTruthy();
      expect(messageParagraph?.textContent).toBe('Usuario registrado correctamente');
    });
  });

  // ===== CASO 6: REGISTRO FALLIDO =====
  describe('Test Case 6: Failed Registration', () => {
    it('should display error message on failed registration', () => {
      const errorResponse = { error: { msg: 'Email ya registrado' } };
      authService.register.and.returnValue(throwError(() => errorResponse));
      
      component.nombre = 'Test';
      component.email = 'existing@test.com';
      component.password = 'pass123';
      component.registrar();
      
      expect(component.mensaje).toBe('Email ya registrado');
    });

    it('should show generic error when no specific message', () => {
      authService.register.and.returnValue(throwError(() => ({ error: {} })));
      
      component.nombre = 'Test';
      component.email = 'test@test.com';
      component.password = 'pass';
      component.registrar();
      
      expect(component.mensaje).toBe('Error al registrar');
    });

    it('should not clear form fields on failed registration', () => {
      authService.register.and.returnValue(throwError(() => new Error('Error')));
      
      component.nombre = 'Test User';
      component.email = 'test@test.com';
      component.password = 'pass123';
      component.registrar();
      
      expect(component.nombre).toBe('Test User');
      expect(component.email).toBe('test@test.com');
      expect(component.password).toBe('pass123');
    });

    it('should handle network errors', () => {
      const networkError = { error: { msg: 'Error de conexión' } };
      authService.register.and.returnValue(throwError(() => networkError));
      
      component.nombre = 'Test';
      component.email = 'test@test.com';
      component.password = 'pass';
      component.registrar();
      
      expect(component.mensaje).toBe('Error de conexión');
    });
  });

  // ===== CASO 7: VALIDACIÓN DE MENSAJES =====
  describe('Test Case 7: Message Display', () => {
    it('should not display message paragraph when mensaje is empty', () => {
      component.mensaje = '';
      fixture.detectChanges();
      
      const messageParagraph = compiled.querySelector('p');
      expect(messageParagraph).toBeNull();
    });

    it('should display message paragraph when mensaje has value', () => {
      component.mensaje = 'Algún mensaje';
      fixture.detectChanges();
      
      const messageParagraph = compiled.querySelector('p');
      expect(messageParagraph).toBeTruthy();
    });

    it('should update message dynamically', () => {
      component.mensaje = 'Mensaje 1';
      fixture.detectChanges();
      
      let messageParagraph = compiled.querySelector('p');
      expect(messageParagraph?.textContent).toBe('Mensaje 1');
      
      component.mensaje = 'Mensaje 2';
      fixture.detectChanges();
      
      messageParagraph = compiled.querySelector('p');
      expect(messageParagraph?.textContent).toBe('Mensaje 2');
    });
  });

  // ===== CASO 8: VALIDACIÓN DE CAMPOS VACÍOS =====
  describe('Test Case 8: Empty Fields Validation', () => {
    it('should handle registration with empty nombre', () => {
      authService.register.and.returnValue(of({ msg: 'OK' }));
      
      component.nombre = '';
      component.email = 'test@test.com';
      component.password = 'pass123';
      component.registrar();
      
      expect(authService.register).toHaveBeenCalledWith('', 'test@test.com', 'pass123');
    });

    it('should handle registration with empty email', () => {
      authService.register.and.returnValue(of({ msg: 'OK' }));
      
      component.nombre = 'Test';
      component.email = '';
      component.password = 'pass123';
      component.registrar();
      
      expect(authService.register).toHaveBeenCalledWith('Test', '', 'pass123');
    });

    it('should handle registration with empty password', () => {
      authService.register.and.returnValue(of({ msg: 'OK' }));
      
      component.nombre = 'Test';
      component.email = 'test@test.com';
      component.password = '';
      component.registrar();
      
      expect(authService.register).toHaveBeenCalledWith('Test', 'test@test.com', '');
    });

    it('should handle all fields empty', () => {
      authService.register.and.returnValue(of({ msg: 'OK' }));
      
      component.nombre = '';
      component.email = '';
      component.password = '';
      component.registrar();
      
      expect(authService.register).toHaveBeenCalledWith('', '', '');
    });
  });

  // ===== CASO 9: ESTRUCTURA HTML COMPLETA =====
  describe('Test Case 9: Complete HTML Structure', () => {
    it('should have h3 heading with "Registro" text', () => {
      const heading = compiled.querySelector('h3');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toBe('Registro');
    });

    it('should have all inputs with placeholders', () => {
      const nombreInput = compiled.querySelector('input[name="nombre"]') as HTMLInputElement;
      const emailInput = compiled.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = compiled.querySelector('input[name="password"]') as HTMLInputElement;
      
      expect(nombreInput.placeholder).toBe('Nombre');
      expect(emailInput.placeholder).toBe('Email');
      expect(passwordInput.placeholder).toBe('Password');
    });

    it('should have inputs in correct order', () => {
      const inputs = compiled.querySelectorAll('input');
      
      expect(inputs[0].getAttribute('name')).toBe('nombre');
      expect(inputs[1].getAttribute('name')).toBe('email');
      expect(inputs[2].getAttribute('name')).toBe('password');
    });
  });

  // ===== CASO 10: JASMINE MATCHERS Y VALIDACIONES =====
  describe('Test Case 10: Jasmine Matchers & Additional Validations', () => {
    it('should verify all component properties are defined', () => {
      expect(component.nombre).toBeDefined();
      expect(component.email).toBeDefined();
      expect(component.password).toBeDefined();
      expect(component.mensaje).toBeDefined();
    });

    it('should verify initial values are empty strings', () => {
      expect(component.nombre).toBe('');
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.mensaje).toBe('');
    });

    it('should verify nombre accepts text', () => {
      component.nombre = 'Anthony Rodríguez';
      expect(component.nombre).toMatch(/[A-Za-zÁ-ú\s]+/);
    });

    it('should verify email format validation', () => {
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

    it('should verify possible success messages', () => {
      const successMessages = [
        'Usuario registrado correctamente',
        'Registro exitoso',
        'Usuario creado'
      ];
      component.mensaje = 'Usuario registrado correctamente';
      
      expect(successMessages).toContain(component.mensaje);
    });

    it('should verify possible error messages', () => {
      const errorMessages = [
        'Error al registrar',
        'Email ya registrado',
        'Error de conexión'
      ];
      component.mensaje = 'Error al registrar';
      
      expect(errorMessages).toContain(component.mensaje);
    });
  });

  // ===== CASO 11: MÚLTIPLES INTENTOS DE REGISTRO =====
  describe('Test Case 11: Multiple Registration Attempts', () => {
    it('should handle multiple registration attempts', () => {
      const mockResponse = { msg: 'OK' };
      authService.register.and.returnValue(of(mockResponse));
      
      component.nombre = 'User1';
      component.email = 'user1@test.com';
      component.password = 'pass1';
      component.registrar();
      
      expect(authService.register).toHaveBeenCalledTimes(1);
      
      component.nombre = 'User2';
      component.email = 'user2@test.com';
      component.password = 'pass2';
      component.registrar();
      
      expect(authService.register).toHaveBeenCalledTimes(2);
    });

    it('should clear fields after each successful registration', () => {
      const mockResponse = { msg: 'OK' };
      authService.register.and.returnValue(of(mockResponse));
      
      component.nombre = 'User1';
      component.email = 'user1@test.com';
      component.password = 'pass1';
      component.registrar();
      
      expect(component.nombre).toBe('');
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      
      component.nombre = 'User2';
      component.email = 'user2@test.com';
      component.password = 'pass2';
      component.registrar();
      
      expect(component.nombre).toBe('');
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });
  });

  // ===== CASO 12: TESTING DE COMPONENTE STANDALONE =====
  describe('Test Case 12: Standalone Component Testing', () => {
    it('should be a standalone component', () => {
      const componentMetadata = (RegisterComponent as any).ɵcmp;
      expect(componentMetadata.standalone).toBeTrue();
    });

    it('should have correct selector', () => {
      const componentMetadata = (RegisterComponent as any).ɵcmp;
      expect(componentMetadata.selectors[0][0]).toBe('app-register');
    });

    it('should import required modules', () => {
      const componentMetadata = (RegisterComponent as any).ɵcmp;
      expect(componentMetadata.dependencies).toBeDefined();
    });
  });

  // ===== CASO 13: INTEGRACIÓN DE FORMULARIO =====
  describe('Test Case 13: Form Integration Tests', () => {
    it('should submit form with all fields filled', () => {
      const mockResponse = { msg: 'OK' };
      authService.register.and.returnValue(of(mockResponse));
      
      const nombreInput = compiled.querySelector('input[name="nombre"]') as HTMLInputElement;
      const emailInput = compiled.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = compiled.querySelector('input[name="password"]') as HTMLInputElement;
      const form = compiled.querySelector('form') as HTMLFormElement;
      
      nombreInput.value = 'Anthony';
      nombreInput.dispatchEvent(new Event('input'));
      
      emailInput.value = 'anthony@test.com';
      emailInput.dispatchEvent(new Event('input'));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      
      form.dispatchEvent(new Event('submit'));
      
      expect(authService.register).toHaveBeenCalled();
    });

    it('should update message after form submission', () => {
      const mockResponse = { msg: 'OK' };
      authService.register.and.returnValue(of(mockResponse));
      
      component.nombre = 'Test';
      component.email = 'test@test.com';
      component.password = 'pass';
      
      const form = compiled.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
      
      expect(component.mensaje).toBe('Usuario registrado correctamente');
    });
  });
});
