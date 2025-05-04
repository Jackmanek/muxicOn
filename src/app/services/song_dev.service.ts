import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Método para obtener los headers con el token de autenticación
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Obtener todas las canciones
  getSongs(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/songs/`, { headers });
  }

  // Buscar canciones por término
  searchSongs(query: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/songs/search/?q=${encodeURIComponent(query)}`, { headers });
  }

  // Obtener una canción específica
  getSongById(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/songs/${id}/`, { headers });
  }

  // Añadir una nueva canción
  addSong(formData: FormData): Observable<any> {
    const headers = this.getHeaders();
    // No incluimos Content-Type porque FormData lo establece automáticamente con el boundary
    return this.http.post(`${this.baseUrl}/songs/add/`, formData, { headers });
  }

  // Eliminar una canción
  deleteSong(songId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/songs/delete/${songId}/`, { headers });
  }

  // Descargar una canción
  downloadSong(songId: number): Observable<Blob> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/songs/download/?id=${songId}`, {
      headers,
      responseType: 'blob'  // Importante para recibir el archivo como blob
    });
  }
}
