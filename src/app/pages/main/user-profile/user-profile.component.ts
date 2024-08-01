import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isFollowing?: boolean; // Optional property to track following status
}

interface Post {
  author: string; // או authorName
  authorName: string;
  authorProfileImage: string; 
  createdAt: Date;
  description: string;
  image?: string;
  likes: any[];
  shares: any[];
  liked?: boolean;
  shared?: boolean;
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
  uploadedContent: any[] = [];
  sortedContent: Post[] = [];
  sortOption: string = 'date';
  currentUsername: string = ''; // משתנה לשם המשתמש הנוכחי
  searchQuery: string = ''; // add

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      const username = params['username'];
      this.setCurrentUser(); // הגדרת המשתמש הנוכחי
      await this.loadUserProfile(username);
      await this.loadPublicUserPosts(username);
      await this.loadFollowingList(); // טעינת רשימת העוקבים
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

  async loadUserProfile(username: string) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.user = await firstValueFrom(this.http.get<User>(`${this.apiUrl}/users/${username}`, { headers }));
      
// שליחת בקשה לשרת לקבל את רשימת העוקבים של המשתמש הנוכחי
      const followingResponse = await firstValueFrom(this.http.get<{ following: string[] }>(`${this.apiUrl}/current-user-following`, { headers }));
      
// בדיקה אם המשתמש שהפרופיל שלו נצפה נמצא ברשימת העוקבים
      this.user.isFollowing = followingResponse.following.includes(username);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async loadPublicUserPosts(username: string) {
    try {
      this.uploadedContent = await firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/public-uploaded-content/${username}`));
      console.log(this.uploadedContent);
      this.sortedContent = this.sortPosts(this.uploadedContent, this.sortOption);

    } catch (error) {
      console.error('Error loading public uploaded-content list:', error);
    }
  }

  sortPosts(contentArray: any[], option: string): any[] {
    this.sortOption = option;
    let sortedArray = [];
    if (option === 'likes') {
      sortedArray = [...contentArray].sort((a, b) => b.likes.length - a.likes.length);
    } else {
      sortedArray = [...contentArray].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sortedArray;
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

  isFollowing(username: string): boolean {
    return this.following.includes(username);
  }

  async followUser(username: string) {
    if (!username) return;
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/following`, { username }, { headers }));
      this.following.push(username);
      if (this.user && this.user.username === username) {
        this.user.isFollowing = true;
      }
      console.log(`Followed user: ${username}`);
    } catch (error) {
      console.error('Error following user:', error);
    }
  }

  async unfollowUser(username: string) {
    if (!username) return;
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/unfollow`, { username }, { headers }));
      this.following = this.following.filter(u => u !== username);
      if (this.user && this.user.username === username) {
        this.user.isFollowing = false;
      }
      console.log(`Unfollowed user: ${username}`);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }

  getTextDirection(text: string): string {
    const isHebrew = /[\u0590-\u05FF]/.test(text);
    return isHebrew ? 'rtl' : 'ltr';
  }

  sanitizeImageUrl(url: string): SafeUrl {

    return this.sanitizer.bypassSecurityTrustUrl(url);
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

  
  onSearch() {
    this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
  }


  goBack() {
    this.router.navigate(['/home-page']); // Change '/previous-page' to the actual route you want to go back to
  }
}
