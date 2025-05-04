import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/services/playlist.service';
import { SongService } from 'src/app/services/song.service';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { addOutline, reorderFourOutline, trashOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { MusicPlayerComponent } from 'src/app/components/music-player/music-player.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playlist-detail',
  templateUrl: './playlist-detail.page.html',
  styleUrls: ['./playlist-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, MusicPlayerComponent],
})
export class PlaylistDetailPage implements OnInit {
  token: string | null = null;
  playlistId!: number;
  playlist: any;
  songs: any[] = [];
  reordering: boolean = false;
  currentSong: any = null;  // La canción actualmente seleccionada para reproducir
  isPlaying: boolean = false;  // Estado de si la canción se está reproduciendo
  // Iconos para usar en la plantilla
  addIcon = addOutline;
  reorderIcon = reorderFourOutline;
  trashIcon = trashOutline;
  isShuffle: boolean = false;
  audioPlayer: HTMLAudioElement = new Audio();
  currentSongIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private playlistService: PlaylistService,
    private songService: SongService,
    private alertController: AlertController,
    private toastController: ToastController
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
  playSong(song: any) {
    this.currentSong = song;
    this.isPlaying = true;  // Al seleccionar una canción, comenzamos a reproducirla
  }
  removeSong(songId: number) {
    this.playlistService.removeSongFromPlaylist(this.playlistId, songId).subscribe(() => {
      this.showToast('Canción eliminada de la playlist');
      this.loadSongs();
    }, error => {
      this.showToast('Error al eliminar la canción');
    });
  }

  toggleReordering() {
    this.reordering = !this.reordering;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  handleReorder(event: any) {
    // Obtener el elemento que se está moviendo
    const itemMove = this.songs.splice(event.detail.from, 1)[0];
    // Insertar el elemento en la nueva posición
    this.songs.splice(event.detail.to, 0, itemMove);
    // Completar la operación de reordenamiento de la interfaz
    event.detail.complete();

    // Obtener la lista de IDs en el nuevo orden
    const songIds = this.songs.map(song => song.id);

    // Actualizar el orden en el backend
    this.playlistService.reorderPlaylistSongs(this.playlistId, songIds).subscribe(() => {
      this.showToast('Playlist reordenada');
    }, error => {
      this.showToast('Error al reordenar la playlist');
      // Si hay error, recargar las canciones para restaurar el orden original
      this.loadSongs();
    });
  }

  async openAddSongModal() {
    try {
      // Primero obtenemos todas las canciones disponibles
      this.songService.getSongs().subscribe(async (allSongs: any) => {
        // Filtrar las canciones que ya están en la playlist
        const availableSongs = allSongs.filter((song: any) =>
          !this.songs.some(playlistSong => playlistSong.id === song.id)
        );

        if (availableSongs.length === 0) {
          this.showToast('No hay canciones disponibles para añadir');
          return;
        }

        // Crear las opciones para el alert
        const inputs = availableSongs.map((song: any) => ({
          name: `song-${song.id}`,
          type: 'radio' as const,  // Esto soluciona el error de tipado
          label: `${song.title} - ${song.artist}`,
          value: song.id
        }));

        const alert = await this.alertController.create({
          header: 'Añadir canción',
          inputs,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Añadir',
              handler: (songId) => {
                if (songId) {
                  this.addSongToPlaylist(songId);
                }
              }
            }
          ]
        });

        await alert.present();
      });
    } catch (error) {
      console.error('Error al cargar canciones:', error);
      this.showToast('Error al cargar las canciones disponibles');
    }
  }

  addSongToPlaylist(songId: number) {
    this.playlistService.addSongToPlaylist(this.playlistId, songId).subscribe(response => {
      this.showToast('Canción añadida a la playlist');
      this.loadSongs(); // Recargar la lista de canciones
    }, error => {
      this.showToast('Error al añadir la canción');
    });
  }

  togglePlayPause(playing: boolean) {
    console.log('togglePlayPause called with:', playing);

    // Si no hay canción actual, seleccionar la primera
    if (!this.currentSong && this.songs.length > 0) {
      this.playSong(this.songs[0]);
      return;
    }

    // Corregimos la lógica: playing indica el estado DESEADO
    if (playing) {
      // Queremos reproducir
      try {
        const playPromise = this.audioPlayer.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.isPlaying = true;
          }).catch(error => {
            console.error("Error al reproducir:", error);
            this.isPlaying = false;

            if (error.name === 'NotAllowedError') {
              this.presentToast('Toca el botón de reproducción para escuchar la música');
            }
          });
        }
      } catch (error) {
        console.error("Error al reproducir:", error);
        this.isPlaying = false;
      }
    } else {
      // Queremos pausar
      this.audioPlayer.pause();
      this.isPlaying = false;
    }
  }
  presentToast(arg0: string) {
    throw new Error('Method not implemented.');
  }

  prevSong() {
    let newIndex;

    if (this.isShuffle) {
      // Modo aleatorio
      newIndex = Math.floor(Math.random() * this.songs.length);
    } else {
      // Modo normal
      if (this.currentSong > 0) {
        newIndex = this.currentSong - 1;
      } else {
        newIndex = this.songs.length - 1;
      }
    }

    this.playSong(this.songs[newIndex]);
  }

  nextSong() {
    let newIndex;

    if (this.isShuffle) {
      // Modo aleatorio
      newIndex = Math.floor(Math.random() * this.songs.length);
    } else {
      // Modo normal
      if (this.currentSong < this.songs.length - 1) {
        newIndex = this.currentSong + 1;
      } else {
        newIndex = 0;
      }
    }

    this.playSong(this.songs[newIndex]);
  }
}
