import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getPlaylists(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<any[]>(`${this.baseUrl}/playlists/`, { headers });
  }

  createPlaylist(name: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<any>(`${this.baseUrl}/playlists/create/`, { name });
  }

  deletePlaylist(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete<any>(`${this.baseUrl}/playlists/${id}/delete/`);
  }

  getPlaylistSongs(id: number): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<any[]>(`${this.baseUrl}/playlists/${id}/songs/`);
  }

  addSongToPlaylist(playlistId: number, songId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<any>(`${this.baseUrl}/playlists/${playlistId}/add-song/`, { song_id: songId });
  }

  removeSongFromPlaylist(playlistId: number, songId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<any>(`${this.baseUrl}/playlists/${playlistId}/remove-song/`, { song_id: songId });
  }
}
