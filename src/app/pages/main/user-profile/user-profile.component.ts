import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { firstValueFrom } from 'rxjs';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  // שדות נוספים בהתאם למודל המשתמש
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isCurrentUser: boolean = false; // משתנה לבדיקה אם זה המשתמש הנוכחי
  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      const username = params['username'];
      await this.loadUserProfile(username);
    });
  }

  async loadUserProfile(username: string) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.user = await firstValueFrom(this.http.get<User>(`${this.apiUrl}/users/${username}`, { headers }));
      
      // בדיקה אם המשתמש הנוכחי הוא זה שמציגים את הפרופיל שלו
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser.username === username) {
        this.router.navigate([`/profile/${username}`]); // הפנייה לפרופיל האישי
      } else {
        this.isCurrentUser = false;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }
}
