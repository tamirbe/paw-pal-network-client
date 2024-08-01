import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private apiUrl = 'http://localhost:3000'; // Ensure this matches your proxy configuration

  constructor(private router: Router, private http: HttpClient) { }

  login(username: string, password: string): Observable<boolean> {
    const url = `${this.apiUrl}/login`;
    return this.http.post<{ token: string }>(url, { username, password }).pipe(
      map(response => {
        if (response.token) {
          sessionStorage.setItem('authToken', response.token);
          this.isAuthenticated = true;
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login failed', error);
        return of(false);
      })
    );
  }

  register(username: string, firstName: string, lastName: string, email: string, password: string, dateOfBirth: string): Observable<string> {
    const url = `${this.apiUrl}/register`;
    return this.http.post<{ message: string }>(url, { username, firstName, lastName, email, password, dateOfBirth }).pipe(
      map(response => 'User registered'),
      catchError(error => {
        console.error('Registration failed', error);
        return of(error.error);
      })
    );
  }


  logout(): void {
    this.isAuthenticated = false;
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/']);
  }

  getAuthStatus(): boolean {
    if (sessionStorage.getItem('authToken')) {
      this.isAuthenticated = true;
    }
    return this.isAuthenticated;
  }
  setToken(token: string): void {
    sessionStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    const token = sessionStorage.getItem('authToken');
    return token;
  }

  removeToken(): void {
    sessionStorage.removeItem('authToken');
  }

}