import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Login</h2>

    <form (ngSubmit)="login()">
      <input
        type="email"
        placeholder="Email"
        [(ngModel)]="email"
        name="email"
        required
      />

      <br><br>

      <input
        type="password"
        placeholder="Password"
        [(ngModel)]="password"
        name="password"
        required
      />

      <br><br>

      <button type="submit">Ingresar</button>
    </form>

    <p *ngIf="error" style="color:red">{{ error }}</p>
  `
})
export class LoginComponent {

  email = '';
  password = '';
  error = '';

  // 🔥 EVENTO PARA AVISAR AL PADRE
  @Output() loginExitoso = new EventEmitter<void>();

  private authService = inject(AuthService);

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.token);

        // 🔥 AVISAMOS AL APP COMPONENT
        this.loginExitoso.emit();
      },
      error: () => {
        this.error = 'Credenciales incorrectas';
      }
    });
  }
}
