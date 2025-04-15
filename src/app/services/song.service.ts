import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  constructor(private http: HttpClient) {}

  getSongs(): Observable<any> {
    // Obtener el token desde el localStorage
    const token = localStorage.getItem('access_token');

    if (token) {
      // Si el token está presente, se incluye en los encabezados
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // Hacer la solicitud GET a la API, incluyendo los encabezados
      return this.http.get('http://127.0.0.1:8000/api/songs/', { headers });
    } else {
      // Si no hay token, manejar el caso adecuadamente (redirigir a login o mostrar un error)
      throw new Error('No token found');
    }
  }
  searchSongs(query: string) {
    return this.http.get(`http://127.0.0.1:8000/api/songs/search/?q=${encodeURIComponent(query)}`);
  }
}
