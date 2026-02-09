import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { LibroService } from './core/services/libro.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoginComponent,
    RegisterComponent
  ],
  template: `
    <!-- LOGIN / REGISTER -->
    <div class="auth-wrapper" *ngIf="!logueado">
      <h1> Biblioteca Digital</h1>

      <!-- LOGIN -->
      <app-login
        *ngIf="!mostrarRegistro"
        (loginExitoso)="onLoginExitoso()">
      </app-login>

      <p class="switch-text" *ngIf="!mostrarRegistro">
        ¿No tienes cuenta?
        <button class="link-button" (click)="mostrarRegistro = true">
          Regístrate
        </button>
      </p>

      <!-- REGISTER -->
      <app-register *ngIf="mostrarRegistro"></app-register>

      <p class="switch-text" *ngIf="mostrarRegistro">
        ¿Ya tienes cuenta?
        <button class="link-button" (click)="mostrarRegistro = false">
          Volver al login
        </button>
      </p>
    </div>

    <!-- APP PRINCIPAL - DASHBOARD PROFESIONAL -->
    <div class="dashboard" *ngIf="logueado">
      
      <!-- HEADER -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="header-title">
            <h1>📚 Sistema de Gestión de Biblioteca</h1>
            <p class="header-subtitle">Panel de Administración</p>
          </div>
          <button class="btn-logout-header" (click)="logout()">
            🚪 Cerrar sesión
          </button>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="dashboard-main">
        
        <!-- FORMULARIO LATERAL -->
        <aside class="sidebar-form">
          <div class="form-card">
            <h2>{{ modoEdicion ? '✏️ Editar Libro' : '➕ Nuevo Libro' }}</h2>
            
            <form (ngSubmit)="guardarLibro()">
              <div class="form-field">
                <label for="titulo">Título</label>
                <input
                  id="titulo"
                  type="text"
                  placeholder="Ingrese el título del libro"
                  [(ngModel)]="titulo"
                  name="titulo"
                  required
                />
              </div>

              <div class="form-field">
                <label for="autor">Autor</label>
                <input
                  id="autor"
                  type="text"
                  placeholder="Ingrese el nombre del autor"
                  [(ngModel)]="autor"
                  name="autor"
                  required
                />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary">
                  {{ modoEdicion ? '💾 Actualizar' : '💾 Guardar' }}
                </button>

                <button
                  *ngIf="modoEdicion"
                  type="button"
                  class="btn-cancel"
                  (click)="cancelarEdicion()"
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </aside>

        <!-- TABLA DE LIBROS -->
        <section class="content-area">
          <div class="table-header">
            <h2>📖 Registro de Libros</h2>
            <div class="table-info">
              <span class="total-count">Total: {{ libros.length }}</span>
            </div>
          </div>

          <!-- TABLA -->
          <div class="table-container" *ngIf="libros.length > 0">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-icon"></th>
                  <th class="col-title">Título</th>
                  <th class="col-author">Autor</th>
                  <th class="col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let libro of libros; let i = index">
                  <td class="col-icon">
                    <span class="book-number">{{ i + 1 }}</span>
                  </td>
                  <td class="col-title">
                    <strong>{{ libro.titulo }}</strong>
                  </td>
                  <td class="col-author">{{ libro.autor }}</td>
                  <td class="col-actions">
                    <button 
                      class="btn-action btn-edit" 
                      (click)="editarLibro(libro)"
                      title="Editar libro"
                    >
                      ✏️
                    </button>
                    <button 
                      class="btn-action btn-delete" 
                      (click)="eliminarLibro(libro._id)"
                      title="Eliminar libro"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ESTADO VACÍO -->
          <div class="empty-state" *ngIf="libros.length === 0">
            <div class="empty-icon">📚</div>
            <h3>No hay libros registrados</h3>
            <p>Comience agregando un nuevo libro usando el formulario</p>
          </div>

        </section>

      </main>

    </div>
  `,
  styles: [`
    /* LAYOUT GENERAL */
    :host {
      display: block;
      min-height: 100vh;
    }

    /* AUTH WRAPPER */
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .auth-wrapper h1 {
      text-align: center;
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 30px;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: fadeInDown 0.6s ease;
    }

    .switch-text {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
      margin-top: 24px;
      font-weight: 400;
    }

    .link-button {
      background: transparent !important;
      color: #60a5fa !important;
      box-shadow: none !important;
      padding: 6px 12px !important;
      text-decoration: none;
      font-weight: 600;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
      margin: 0 !important;
      border: none;
      cursor: pointer;
    }

    .link-button:hover {
      color: #3b82f6 !important;
      transform: none !important;
      box-shadow: none !important;
      border-bottom-color: #3b82f6;
    }

    /* DASHBOARD */
    .dashboard {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #0a192f 0%, #172a45 100%);
    }

    /* HEADER */
    .dashboard-header {
      background: rgba(10, 25, 47, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 2px solid rgba(59, 130, 246, 0.2);
      padding: 20px 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .header-content {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title h1 {
      color: #ffffff;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 4px 0;
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-subtitle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      margin: 0;
    }

    .btn-logout-header {
      padding: 10px 20px;
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    .btn-logout-header:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.5);
    }

    /* MAIN CONTENT */
    .dashboard-main {
      flex: 1;
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 30px;
      padding: 30px 40px;
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    /* SIDEBAR FORM */
    .sidebar-form {
      position: sticky;
      top: 30px;
      height: fit-content;
    }

    .form-card {
      background: rgba(10, 25, 47, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .form-card h2 {
      color: #ffffff;
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0 0 24px 0;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(59, 130, 246, 0.2);
    }

    .form-field {
      margin-bottom: 20px;
    }

    .form-field label {
      display: block;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .form-field input {
      width: 100%;
      padding: 12px 16px;
      background: rgba(23, 42, 69, 0.6);
      border: 2px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px;
      color: #ffffff;
      font-size: 14px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-field input:focus {
      outline: none;
      border-color: #3b82f6;
      background: rgba(23, 42, 69, 0.8);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-field input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
    }

    .btn-cancel {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .btn-cancel:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
    }

    /* CONTENT AREA */
    .content-area {
      background: rgba(10, 25, 47, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(59, 130, 246, 0.2);
    }

    .table-header h2 {
      color: #ffffff;
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0;
    }

    .table-info {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .total-count {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    /* TABLA */
    .table-container {
      overflow-x: auto;
      border-radius: 8px;
    }

    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .data-table thead {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
    }

    .data-table thead tr th {
      color: #ffffff;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px 20px;
      text-align: left;
      border-bottom: 2px solid rgba(59, 130, 246, 0.3);
    }

    .data-table thead tr th:first-child {
      border-radius: 8px 0 0 0;
    }

    .data-table thead tr th:last-child {
      border-radius: 0 8px 0 0;
    }

    .data-table tbody tr {
      background: rgba(23, 42, 69, 0.3);
      transition: all 0.3s ease;
    }

    .data-table tbody tr:hover {
      background: rgba(59, 130, 246, 0.1);
      transform: scale(1.01);
    }

    .data-table tbody tr td {
      padding: 16px 20px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      border-bottom: 1px solid rgba(59, 130, 246, 0.1);
    }

    .col-icon {
      width: 60px;
      text-align: center;
    }

    .book-number {
      display: inline-block;
      width: 32px;
      height: 32px;
      line-height: 32px;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border-radius: 50%;
      font-weight: 600;
      font-size: 13px;
    }

    .col-title {
      width: 45%;
    }

    .col-title strong {
      color: #ffffff;
      font-weight: 600;
    }

    .col-author {
      width: 35%;
      color: rgba(255, 255, 255, 0.7);
    }

    .col-actions {
      width: 140px;
      text-align: right;
    }

    .btn-action {
      padding: 8px 12px;
      margin-left: 8px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      color: white;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .btn-action:hover {
      transform: translateY(-2px);
    }

    .btn-edit:hover {
      background: rgba(59, 130, 246, 0.4);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-delete {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.4);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    /* EMPTY STATE */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: rgba(255, 255, 255, 0.5);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .empty-state h3 {
      color: rgba(255, 255, 255, 0.7);
      font-size: 20px;
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .empty-state p {
      color: rgba(255, 255, 255, 0.4);
      font-size: 14px;
      margin: 0;
    }

    /* RESPONSIVE */
    @media (max-width: 1200px) {
      .dashboard-main {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .sidebar-form {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        padding: 16px 20px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .btn-logout-header {
        width: 100%;
      }

      .dashboard-main {
        padding: 20px;
      }

      .header-title h1 {
        font-size: 1.4rem;
      }

      .table-container {
        overflow-x: auto;
      }

      .data-table {
        min-width: 600px;
      }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AppComponent {

  libros: any[] = [];
  titulo = '';
  autor = '';

  logueado = false;
  mostrarRegistro = false;

  // 🔥 UPDATE
  modoEdicion = false;
  libroEditandoId: string | null = null;

  private libroService = inject(LibroService);

  ngOnInit() {
    this.logueado = !!localStorage.getItem('token');
    if (this.logueado) {
      this.cargarLibros();
    }
  }

  // 🔹 NUEVO: método que se ejecuta al hacer login exitoso
  onLoginExitoso() {
    this.logueado = true;
    this.mostrarRegistro = false;
    this.cargarLibros();
  }

  cargarLibros() {
    this.libroService.obtenerLibros().subscribe({
      next: res => this.libros = res,
      error: err => console.error(err)
    });
  }

  guardarLibro() {
    if (this.modoEdicion && this.libroEditandoId) {
      // UPDATE
      this.libroService.actualizarLibro(this.libroEditandoId, {
        titulo: this.titulo,
        autor: this.autor
      }).subscribe({
        next: () => this.resetFormulario(),
        error: err => console.error(err)
      });
    } else {
      // CREATE
      this.libroService.crearLibro({
        titulo: this.titulo,
        autor: this.autor
      }).subscribe({
        next: () => this.resetFormulario(),
        error: err => console.error(err)
      });
    }
  }

  editarLibro(libro: any) {
    this.modoEdicion = true;
    this.libroEditandoId = libro._id;
    this.titulo = libro.titulo;
    this.autor = libro.autor;
  }

  cancelarEdicion() {
    this.resetFormulario();
  }

  eliminarLibro(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este libro?')) {
      return;
    }

    this.libroService.eliminarLibro(id).subscribe({
      next: () => this.cargarLibros(),
      error: err => console.error(err)
    });
  }

  resetFormulario() {
    this.titulo = '';
    this.autor = '';
    this.modoEdicion = false;
    this.libroEditandoId = null;
    this.cargarLibros();
  }

  logout() {
    localStorage.removeItem('token');
    location.reload();
  }
}