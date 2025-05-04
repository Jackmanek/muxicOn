import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPlaylists(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/playlists/`, { headers });
  }

  createPlaylist(name: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/playlists/create/`, { name }, {headers});
  }

  deletePlaylist(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.baseUrl}/playlists/delete/${id}/`, {headers});
  }

  getPlaylistSongs(id: number): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/playlists/${id}/songs/`, {headers});
  }

  addSongToPlaylist(playlistId: number, songId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/playlists/${playlistId}/add-song/`, { song_id: songId }, {headers});
  }

  removeSongFromPlaylist(playlistId: number, songId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/playlists/${playlistId}/remove-song/`, { song_id: songId }, {headers});
  }
  reorderPlaylistSongs(playlistId: number, songIds: number[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/playlists/${playlistId}/reorder/`, { song_ids: songIds }, { headers });
  }
}
