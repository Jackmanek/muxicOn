import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AuthPage  {

  authMode: string = 'login';
  loginData = { username: '', password: ''};
  registerData = {username: '', password: '' };
  apiUrl = 'http://127.0.0.1:8000/api/';
  constructor(private http: HttpClient, private navCtrl: NavController) { }

  login(){
    this.http.post(this.apiUrl + 'login/', this.loginData).subscribe(
      (response : any) => {
        localStorage.setItem('access_token', response.access);
        this.navCtrl.navigateForward('/profile');
      },
      error => console.error('Error en login', error)
    );
  }
  register(){
    this.http.post(this.apiUrl+'register/', this.registerData).subscribe(
      () => {
        alert('Registro existoso, ahora inicia sessión.');
        this.authMode = 'login';
      },
      error => console.error('Error en registro', error)
    );
  }
}
