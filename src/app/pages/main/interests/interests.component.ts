import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface Interest {
  _id: string;
  name: string;
  category: string;
}

interface Category {
  name: string;
  interests: Interest[];
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
  interests?: Interest;
}

export interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  pet: string;
}

@Component({
  selector: 'app-interests',
  templateUrl: './interests.component.html',
  styleUrls: ['./interests.component.scss']
})
export class InterestsComponent implements OnInit {
  interests: Interest[] = [];
  user?: User | null;
  posts: Post[] = [];
  popularInterests: Interest[] = [];
  filteredInterests: Interest[] = [];
  followingInterests: Interest[] = [];
  categories: Category[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  currentSection: string = 'allInterests';

  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(private http: HttpClient, private authService: AuthService, private sanitizer: DomSanitizer) {}

  async ngOnInit(): Promise<void> {
    this.loading = true; // Start loading indicator
    this.loadUserFollowingInterests();
    this.loadFollowedInterestsPosts();
    this.loadInterests();
    this.loadPopularInterests();
    this.loadCategories();
    this.loading = false; // Stop loading indicator
  }

  showSection(section: string): void {
    this.currentSection = section;
  }

  getTextDirection(text: string): string {
    const isHebrew = /[\u0590-\u05FF]/.test(text);
    return isHebrew ? 'rtl' : 'ltr';
  }

  async loadFollowedInterestsPosts() {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.posts = await firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/followed-interests-posts`, { headers }));
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }  

  async loadInterests() {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.interests = await firstValueFrom(this.http.get<Interest[]>(`${this.apiUrl}/interests`, { headers }));
      this.filteredInterests = this.interests;
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  }

  async loadPopularInterests() {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.popularInterests = await firstValueFrom(this.http.get<Interest[]>(`${this.apiUrl}/popular-interests`, { headers }));
    } catch (error) {
      console.error('Error loading popular interests:', error);
    }
  }

  async loadUserFollowingInterests() {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.followingInterests = await firstValueFrom(this.http.get<Interest[]>(`${this.apiUrl}/user-interests`, { headers }));
    } catch (error) {
      console.error('Error loading user interests:', error);
    }
  }

  async loadCategories() {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.categories = await firstValueFrom(this.http.get<Category[]>(`${this.apiUrl}/interest-categories`, { headers }));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  onSearch() {
    this.filteredInterests = this.interests.filter(interest =>
      interest.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  isInterestFollowed(interest: Interest): boolean {
    return this.followingInterests.some(followed => followed._id === interest._id);
  }

  async followInterest(interest: Interest) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/follow-interest`, { interestId: interest._id }, { headers }));
      this.followingInterests.push(interest);
    } catch (error) {
      console.error('Error following interest:', error);
    }
  }

  async unfollowInterest(interest: Interest) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/unfollow-interest`, { interestId: interest._id }, { headers }));
      this.followingInterests = this.followingInterests.filter(followed => followed._id !== interest._id);
    } catch (error) {
      console.error('Error unfollowing interest:', error);
    }
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
