import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'https://proyectopruebasp3.onrender.com/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.API}/login`, {
      email,
      password
    });
  }

  // 👇 NUEVO (REGISTER)
  register(nombre: string, email: string, password: string) {
    return this.http.post<any>(`${this.API}/register`, {
      nombre,
      email,
      password
    });
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
