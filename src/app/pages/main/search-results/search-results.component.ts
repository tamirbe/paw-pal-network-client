import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { firstValueFrom } from 'rxjs';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  isFollowing?: boolean; // Optional property to track following status
}

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  users: User[] = [];
  following: string[] = []; // הוספת משתנה following
  query: string = '';
  currentUsername: string = ''; // הוסף משתנה לשם המשתמש הנוכחי

  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      const query = params['query'];
      this.setCurrentUser(); 
      await this.loadFollowing(); // Ensure following list is loaded first
      this.searchUsers(query);
    });
  }

  setCurrentUser() {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = this.parseJwt(token);
      this.currentUsername = decodedToken.username; 
    }
  }

  parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return null;
    }
  }

  async searchUsers(query: string) {
    if (query) {
      try {
        const token = this.authService.getToken();
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.users = await firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/search`, { headers, params: { query } }));
        console.log('Search results:', this.users);

        // Update the following status for each user
        this.users.forEach(user => {
          user.isFollowing = this.isFollowing(user.username);
        });
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }
  }

  onTextAreaInput(event: any): void {
    const text = event.target.value;
    const isHebrew = /[\u0590-\u05FF]/.test(text);
    if (isHebrew) {
      event.target.style.direction = 'rtl';
    } else {
      event.target.style.direction = 'ltr';
    }
  }

  async followUser(username: string) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/following`, { username }, { headers }));
      this.following.push(username);
      console.log(`Followed user: ${username}`);
      
      // עדכון מצב המשתמש המקומי
      const user = this.users.find(user => user.username === username);
      if (user) {
        user.isFollowing = true;
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  }

  async unfollowUser(username: string) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/unfollow`, { username }, { headers }));
      this.following = this.following.filter(u => u !== username);
      console.log(`Unfollowed user: ${username}`);
      
      // עדכון מצב המשתמש המקומי
      const user = this.users.find(user => user.username === username);
      if (user) {
        user.isFollowing = false;
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }

  isFollowing(username: string): boolean {
    return this.following.includes(username);
  }

  async loadFollowing() {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/current-user-following`, { headers }));
      this.following = response.following;
    } catch (error) {
      console.error('Error loading following list:', error);
    }
  }

  goBack() {
    this.router.navigate(['/home-page']); // Change '/previous-page' to the actual route you want to go back to
  }
}
