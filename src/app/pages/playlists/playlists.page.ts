import { Component, OnInit } from '@angular/core';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AlertController, IonicModule, NavController } from '@ionic/angular';
import { IonHeader, IonButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicPlayerComponent } from 'src/app/components/music-player/music-player.component';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.page.html',
  styleUrls: ['./playlists.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PlaylistsPage implements OnInit {
  token: string | null = null;
  playlists: any[] = [];

  constructor(
    private playlistService: PlaylistService,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadToken();
    this.loadPlaylists();
  }
  loadToken() {
    this.token = localStorage.getItem('access_token');
    if (!this.token) {
      console.error('No hay token disponible. El usuario no está autenticado.');
    }
  }

  loadPlaylists() {
    this.playlistService.getPlaylists().subscribe((data: any) => {
      this.playlists = data;
    });
  }

  async openNewPlaylistPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Playlist',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la lista',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            this.playlistService.createPlaylist(data.name).subscribe(() => this.loadPlaylists());
          },
        },
      ],
    });

    await alert.present();
  }

  deletePlaylist(id: number) {
    this.playlistService.deletePlaylist(id).subscribe(() => this.loadPlaylists());
  }

  openPlaylist(playlist: any) {
    this.navCtrl.navigateForward(`/playlists/${playlist.id}`);
  }
}

