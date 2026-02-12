import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LibroService {

  private API = 'https://proyectopruebasp3.onrender.com/api/libros';

  constructor(private http: HttpClient) {}

  obtenerLibros() {
    return this.http.get<any[]>(this.API);
  }

  crearLibro(libro: { titulo: string; autor: string }) {
    return this.http.post(this.API, libro);
  }
  eliminarLibro(id: string) {
  return this.http.delete(`${this.API}/${id}`);
}
actualizarLibro(id: string, data: any) {
  return this.http.put(`${this.API}/${id}`, data);
}

}
