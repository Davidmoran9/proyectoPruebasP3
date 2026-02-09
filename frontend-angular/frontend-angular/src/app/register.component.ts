import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h3>Registro</h3>

    <form (ngSubmit)="registrar()">
      <input
        type="text"
        placeholder="Nombre"
        [(ngModel)]="nombre"
        name="nombre"
        required
      />

      <input
        type="email"
        placeholder="Email"
        [(ngModel)]="email"
        name="email"
        required
      />

      <input
        type="password"
        placeholder="Password"
        [(ngModel)]="password"
        name="password"
        required
      />

      <button type="submit">Registrarse</button>
    </form>

    <p *ngIf="mensaje">{{ mensaje }}</p>
  `
})
export class RegisterComponent {

  nombre = '';
  email = '';
  password = '';
  mensaje = '';

  private authService = inject(AuthService);

  registrar() {
    this.authService.register(
      this.nombre,
      this.email,
      this.password
    ).subscribe({
      next: res => {
        this.mensaje = 'Usuario registrado correctamente';
        this.nombre = '';
        this.email = '';
        this.password = '';
      },
      error: err => {
        this.mensaje = err.error?.msg || 'Error al registrar';
      }
    });
  }
}
