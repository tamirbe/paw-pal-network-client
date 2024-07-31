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

interface Post {
  title: string;
  content: string;
  // שדות נוספים בהתאם למודל הפוסטים
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  userPosts: Post[] = []; // משתנה לשמירת הפוסטים של המשתמש
  isCurrentUser: boolean = false; // משתנה לבדיקה אם זה המשתמש הנוכחי
  following: string[] = []; // משתנה לשמירת רשימת העוקבים
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
      await this.loadUserPosts(username);
      await this.loadFollowingList(); // טעינת רשימת העוקבים
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
        this.isCurrentUser = true;
      } else {
        this.isCurrentUser = false;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async loadUserPosts(username: string) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.userPosts = await firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/users/${username}/posts`, { headers }));
    } catch (error) {
      console.error('Error loading user posts:', error);
    }
  }

  async loadFollowingList() {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/current-user-following`, { headers }));
      this.following = response.following.map((user: any) => user.username);
    } catch (error) {
      console.error('Error loading following list:', error);
    }
  }

  async followUser(username: string) {
    if (!username) return;
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/following`, { username }, { headers }));
      this.following.push(username);
      console.log(`Followed user: ${username}`);
    } catch (error) {
      console.error('Error following user:', error);
    }
  }

  async addFriend(username: string) {
    if (!username) return;
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/friends`, { username }, { headers }));
      console.log(`Added friend: ${username}`);
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  }
}
