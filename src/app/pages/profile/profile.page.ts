import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ProfilePage implements OnInit {
  downloadedSongs: any[] = [];
  token: string | null = null;
  newSongUrl: string = '';
  apiUrl = 'http://127.0.0.1:8000/api/';
  isConverting: boolean = false;
  progressValue: number = 0;

  constructor(private http: HttpClient, private navCtrl: NavController) {}

  ngOnInit() {
    this.loadToken();  // Cargar el token al inicio
    this.loadDownloadedSongs();
  }

  loadToken() {
    this.token = localStorage.getItem('access_token');
    if (!this.token) {
      console.error('No hay token disponible. El usuario no está autenticado.');
    }
  }

  loadDownloadedSongs() {
    if (!this.token) {
      console.error('Token no disponible');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`  // Usamos el token almacenado
    });

    this.http.get('http://127.0.0.1:8000/api/songs/', { headers })
      .subscribe(
        (data: any) => {
          console.log('Canciones descargadas desde la API:', data);
          this.downloadedSongs = data || [];
          localStorage.setItem('downloadedSongs', JSON.stringify(this.downloadedSongs));  // Guardar canciones en localStorage
        },
        (error) => {
          console.error('Error al obtener las canciones descargadas', error);
        }
      );
  }

  deleteSong(song: any) {
    const token = localStorage.getItem('access_token');
    if(!token){
      console.error('Token no disponible, el usuario no esta autenticado');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });

    this.http.delete(`${this.apiUrl}songs/delete/${song.id}/`, { headers })
      .subscribe(
        (response: any)=>{
          console.log('Cancion eliminada correctamente', response);

          this.downloadedSongs = this.downloadedSongs.filter(s => s.id !== song.id);

          localStorage.setItem('downloadedSongs', JSON.stringify(this.downloadedSongs));
        },
      (error) => {
        console.error('Error al eliminar la cancion', error);
      }
    );

  }
  convertSong() {
    if (this.newSongUrl) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No hay token disponible. El usuario no está autenticado.');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      const body = { youtube_url: this.newSongUrl };

      this.isConverting = true;
      this.progressValue = 0;

      this.http.post(this.apiUrl + 'songs/download/', body, { headers })
        .subscribe(
          (response: any) => {
            console.log('Canción convertida y guardada:', response);
            if (response.song) {
              this.downloadedSongs.push({
                title: response.song.title,
                artist: response.song.artist,
                url: response.song,
              });
            }

            this.isConverting = false;
            this.progressValue = 1;
            this.newSongUrl = '';
          },
          (error) => {
            console.error('Error al convertir y guardar la canción:', error);
            this.isConverting = false;
            this.progressValue = 1;
          }
        );
        let interval = setInterval(() => {
          if (this.progressValue < 1) {
            this.progressValue += 0.05;  // Aumentar el progreso
          } else {
            clearInterval(interval);  // Detener la simulación cuando el progreso llegue a 100%
          }
        }, 500);  // Esto aumentará la barra cada 500 ms

    } else {
      console.error('Por favor ingresa una URL de canción de YouTube');
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    this.navCtrl.navigateRoot('/auth');  // Redirige a la página de login
  }

  home(){

    this.navCtrl.navigateForward('/home');
  }
}
