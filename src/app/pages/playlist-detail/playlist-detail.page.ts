import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { IonHeader, IonButton, IonToolbar } from "@ionic/angular/standalone";
import { PlaylistsPage } from '../playlists/playlists.page';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-playlist-detail',
  templateUrl: './playlist-detail.page.html',
  styleUrls: ['./playlist-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PlaylistDetailPage implements OnInit {
  token: string | null = null;
  playlistId!: number;
  playlist: any;
  songs: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService
  ) {}

  ngOnInit() {
    this.loadToken();
    this.playlistId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlaylist();
    this.loadSongs();
  }
  loadToken() {
    this.token = localStorage.getItem('access_token');
    if (!this.token) {
      console.error('No hay token disponible. El usuario no está autenticado.');
    }
  }

  loadPlaylist() {
    this.playlistService.getPlaylists().subscribe((value: any) => {
      const playlists = value as any[];
      this.playlist = playlists.find(p => p.id === this.playlistId);
    });
  }

  loadSongs() {
    this.playlistService.getPlaylistSongs(this.playlistId).subscribe((value: any) => {
      this.songs = value as any[];
    });
  }

  removeSong(songId: number) {
    this.playlistService.removeSongFromPlaylist(this.playlistId, songId).subscribe(() => {
      this.loadSongs();
    });
  }
}
