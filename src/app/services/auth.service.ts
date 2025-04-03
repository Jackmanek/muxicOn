// auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    this.http.post('http://127.0.0.1:8000/api/login/', { username, password }).subscribe((response: any)=>{
      localStorage.setItem('access_token', response.access);
    });
    return this.http.post('http://127.0.0.1:8000/api/login/', { username, password });

  }

  getToken() {
    return localStorage.getItem('access_token');
  }
}
