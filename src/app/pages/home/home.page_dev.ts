import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { SongService } from '../../services/song.service';
import { Router } from '@angular/router';
import { MusicPlayerComponent } from 'src/app/components/music-player/music-player.component';
import { PlaylistsPage } from '../playlists/playlists.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, MusicPlayerComponent]
})
export class HomePage implements OnInit, OnDestroy {
  songs: any[] = [];
  currentSongIndex: number = 0;
  currentSong: any = null;
  isPlaying: boolean = false;
  duration: number = 0;
  currentTime: number = 0;
  audioPlayer: HTMLAudioElement = new Audio();
  isShuffle: boolean = false;
  loopMode: string = 'none';
  volume: number = 1;
  apiUrl = 'http://127.0.0.1:8000/api/';
  showPlayMessage: boolean = false;
  audioUpdateInterval: any = null;
  userInteracted: boolean = false;
  searchTerm: string = '';
  allSongs: any[] = [];

  constructor(
    private http: HttpClient,
    private songsService: SongService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.setupAudioPlayer();
    this.getSongs();

    // Detectar interacción del usuario con la página
    document.addEventListener('click', () => {
      this.userInteracted = true;
    });
  }

  ngOnDestroy() {
    // Limpiar recursos al destruir el componente
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
      this.audioPlayer.removeEventListener('timeupdate', this.updateProgressBar.bind(this));
      this.audioPlayer.removeEventListener('ended', this.handleSongEnd.bind(this));
    }

    if (this.audioUpdateInterval) {
      clearInterval(this.audioUpdateInterval);
    }
  }

  setupAudioPlayer() {
    this.audioPlayer = new Audio();
    this.audioPlayer.volume = this.volume;

    // Configurar eventos del reproductor de audio
    this.audioPlayer.addEventListener('timeupdate', this.updateProgressBar.bind(this));
    this.audioPlayer.addEventListener('ended', this.handleSongEnd.bind(this));
    this.audioPlayer.addEventListener('loadedmetadata', () => {
      this.duration = this.audioPlayer.duration;
    });

    this.audioPlayer.addEventListener('error', (e) => {
      console.error('Error de audio:', e);
      this.presentToast('Error al reproducir la canción. Intenta de nuevo.');
    });
  }

  getSongs() {
    this.songsService.getSongs().subscribe(
      (data: any) => {
        this.allSongs = data;
        this.songs = [...this.allSongs];
        if (this.songs.length > 0) {
          this.currentSong = this.songs[0];
          this.currentSongIndex = 0;
          this.prepareAudio(this.currentSong);
        }
      },
      (error) => {
        console.error('Error al obtener canciones', error);
        this.presentToast('No se pudieron cargar las canciones. Verifica tu conexión.');
      }
    );
  }

  filterSongs() {
    const term = this.searchTerm.trim();

    if (term === '') {
      this.songs = [...this.allSongs]; // Vuelve al cache local si no hay término
      return;
    }

    this.songsService.searchSongs(term).subscribe(
      (results: any) => {
        this.songs = results;
      },
      (error) => {
        console.error("Error al buscar canciones:", error);
        this.presentToast('Error al buscar canciones');
      }
    );
  }

  prepareAudio(song: any) {
    if (!song) return;

    const filePath = encodeURI(`http://127.0.0.1:8000${song.file}`);

    // Solo preparamos el audio sin reproducirlo
    this.audioPlayer.src = filePath;
    this.audioPlayer.load();

    // Mostrar mensaje para que el usuario interactúe
    if (!this.userInteracted) {
      this.presentToast('Toca el botón de reproducción para escuchar la música');
    }
  }

  async playSong(song: any) {
    // Si es la misma canción, solo toggle play/pause
    if (this.currentSong && this.currentSong.id === song.id) {
      this.togglePlayPause(!this.isPlaying);
      return;
    }

    this.currentSong = song;
    this.currentSongIndex = this.songs.findIndex(s => s.id === song.id);
    const filePath = encodeURI(`http://127.0.0.1:8000${song.file}`);

    try {
      // Pausar reproducción actual
      this.audioPlayer.pause();

      // Configurar nueva fuente
      this.audioPlayer.src = filePath;
      this.audioPlayer.load();

      // Intentar reproducir
      const playPromise = this.audioPlayer.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Reproducción exitosa
          this.isPlaying = true;
        }).catch(error => {
          console.error("Error al reproducir audio:", error);
          this.isPlaying = false;

          if (error.name === 'NotAllowedError') {
            this.presentToast('Toca el botón de reproducción para escuchar la música');
          }
        });
      }
    } catch (error) {
      console.error("Error al configurar audio:", error);
      this.isPlaying = false;
      this.presentToast('Error al reproducir la canción');
    }
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

  prevSong() {
    let newIndex;

    if (this.isShuffle) {
      // Modo aleatorio
      newIndex = Math.floor(Math.random() * this.songs.length);
    } else {
      // Modo normal
      if (this.currentSongIndex > 0) {
        newIndex = this.currentSongIndex - 1;
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
      if (this.currentSongIndex < this.songs.length - 1) {
        newIndex = this.currentSongIndex + 1;
      } else {
        newIndex = 0;
      }
    }

    this.playSong(this.songs[newIndex]);
  }

  handleSongEnd() {
    // Cuando termina una canción
    if (this.loopMode === 'one') {
      // Repetir la misma canción
      this.audioPlayer.currentTime = 0;
      this.audioPlayer.play().catch(err => console.error('Error al repetir canción:', err));
    } else if (this.loopMode === 'all' || this.isShuffle) {
      // Pasar a la siguiente canción
      this.nextSong();
    } else {
      // Sin repetición, si es la última canción, detener
      if (this.currentSongIndex >= this.songs.length - 1) {
        this.isPlaying = false;
      } else {
        this.nextSong();
      }
    }
  }

  updateProgressBar() {
    this.currentTime = this.audioPlayer.currentTime;
    this.duration = this.audioPlayer.duration || 0;
  }

  seekAudio() {
    if (this.audioPlayer) {
      this.audioPlayer.currentTime = this.currentTime;
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  loadPlaylists(){
    this.router.navigate(['/playlists']);
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    console.log("Modo aleatorio:", this.isShuffle);
  }

  toggleLoop() {
    if (this.loopMode === 'none') {
      this.loopMode = 'all';  // Repetir toda la lista
      this.audioPlayer.loop = false;
    } else if (this.loopMode === 'all') {
      this.loopMode = 'one';  // Repetir solo una canción
      this.audioPlayer.loop = true;
    } else {
      this.loopMode = 'none';  // Sin repetición
      this.audioPlayer.loop = false;
    }
    console.log("Modo de repetición:", this.loopMode);
  }

  setVolume() {
    if (this.audioPlayer) {
      this.audioPlayer.volume = this.volume;
    }
    console.log("Volumen:", this.volume);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'middle',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
