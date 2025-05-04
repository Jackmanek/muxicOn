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
  loginError: string | null = null;
  registerError: string | null = null;

  constructor(private http: HttpClient, private navCtrl: NavController) { }

  login(){
    this.loginError = null;

    this.http.post(this.apiUrl + 'login/', this.loginData).subscribe(
      (response : any) => {
        localStorage.setItem('access_token', response.access);
        this.navCtrl.navigateForward('/home');
      },
      error => {
        if (error.status === 400 && error.error?.message){
          this.loginError = error.error.message;
        }else{
          this.loginError = 'Ocurrio un error inesperado. Intenta mas tarde.';
        }
        console.error('Error en login', error);
      }
    );
  }
  register(){
    this.registerError = null;

    this.http.post(this.apiUrl + 'register/', this.registerData, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe(
      () => {
        alert('Registro exitoso, ahora inicia sesión.');
        this.authMode = 'login';
      },
      error => {
        if (error.status === 400 && error.error?.errors) {
          // Juntar todos los errores en un solo string
          this.registerError = Object.values(error.error.errors).join(' ');
        } else {
          this.registerError = 'Error inesperado al registrar. Intenta de nuevo.';
        }
        console.error('Error en registro', error);
      }
    );
  }
}
