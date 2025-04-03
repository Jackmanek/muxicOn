import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SongService } from '../../services/song.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class HomePage implements OnInit {
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

  constructor(private http: HttpClient, private songsService: SongService, private router: Router) {}

  ngOnInit() {
    this.getSongs();
    this.audioPlayer = new Audio(); 
    this.audioPlayer.addEventListener('timeupdate', this.updateProgressBar.bind(this));
    this.audioPlayer.volume = this.volume;
    
  }

  getSongs() {
    this.songsService.getSongs().subscribe(
      (data: any) => {
        this.songs = data;
        if (this.songs.length > 0) {
          this.currentSong = this.songs[0]; 
          setTimeout(() => {
            this.playSong(this.currentSong);  
          }, 500);
        }
      },
      (error) => {
        console.error('Error al obtener canciones', error);
      }
    );
  }

  playSong(song: any) {
    this.currentSong = song;
    this.currentSongIndex = this.songs.findIndex(s => s.id === song.id);
    const filePath = encodeURI(`http://127.0.0.1:8000${song.file}`);

    if (this.audioPlayer) {
      this.audioPlayer.pause(); 
      this.audioPlayer.src = filePath;
      this.audioPlayer.load();  
      this.audioPlayer.play().catch(error => console.error("Error al reproducir audio:", error));
      this.isPlaying = true;
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.audioPlayer.pause();
    } else {
      this.audioPlayer.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  prevSong() {
    if (this.currentSongIndex > 0) {
      this.currentSongIndex--;
    } else {
      this.currentSongIndex = this.songs.length - 1;
    }
    this.playSong(this.songs[this.currentSongIndex]);
  }

  nextSong() {
    if (this.currentSongIndex < this.songs.length - 1) {
      this.currentSongIndex++;
    } else {
      this.currentSongIndex = 0;
    }
    this.playSong(this.songs[this.currentSongIndex]);
  }

  updateProgressBar() {
    this.currentTime = this.audioPlayer.currentTime;
    this.duration = this.audioPlayer.duration;
  }

  seekAudio() {
    this.audioPlayer.currentTime = this.currentTime;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
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
    this.audioPlayer.volume = this.volume;
    console.log("Volumen:", this.volume);
  }
}
