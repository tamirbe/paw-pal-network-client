import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private apiUrl = 'http://localhost:3000/login'; // Ensure this matches your proxy configuration

  constructor(private router: Router, private http: HttpClient) { }

  login(username: string, password: string): Observable<boolean> {
    const url = `${this.apiUrl}`;
    return this.http.post<{ token: string }>(url, { username, password }).pipe(
      map(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
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

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem('authToken');
    this.router.navigate(['/']);
  }

  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }
}