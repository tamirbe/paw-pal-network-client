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
  _id?: string;
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
  saves: string[];
  saved: boolean;
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
  currentUser: string = '';
  interests: Interest[] = [];
  user?: User | null;
  posts: Post[] = [];
  popularInterests: Interest[] = [];
  filteredInterests: Interest[] = [];
  followingInterests: Interest[] = [];
  categories: Category[] = [];
  searchQuery: string = '';
  saveSuccess: boolean = false;
  unsaveSuccess: boolean = false;
  loading: boolean = false;
  currentUserName: string = ''; // הוספת משתנה לאחסון שם המשתמש הנוכחי

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
    this.loadUserDetails()
    this.loading = false; // Stop loading indicator
  }

  showSection(section: string): void {
    this.currentSection = section;
  }

  getTextDirection(text: string): string {
    const isHebrew = /[\u0590-\u05FF]/.test(text);
    return isHebrew ? 'rtl' : 'ltr';
  }

  async likePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      
      if (post.liked) {
        post.liked = false;
        post.likes = post.likes.filter(like => like !== this.currentUser); // מסיר את המשתמש מרשימת הלייקים
        } 
        else {
        post.liked = true;
        post.likes.push(this.currentUser);
      }
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/like`, {}, { headers }));
      this.updateLikes(post);

    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  }

  updateLikes(post: Post) {
    const updatedPostIndex = this.posts.findIndex(p => p._id === post._id);
    if (updatedPostIndex !== -1) {
      this.posts[updatedPostIndex] = { ...post };
    }
  }

  

  async sharePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        
      const sharedPost: Post = await firstValueFrom(this.http.post<Post>(`${this.apiUrl}/posts/${post._id}/share`, {}, { headers }));

      this.posts.push(sharedPost); 
    } catch (error) {
      console.error('Error sharing/unsharing post:', error);
    }
  }

  async savePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      if (!post.saves) {
        post.saves = [];
      }

      if (post.saved) {
        post.saved = false;
        post.saves = post.saves.filter(save => save !== this.currentUser);
      } else {
        post.saved = true;
        post.saves.push(this.currentUser);
      }
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/save`, {}, { headers }));
      if (post.saved){
        this.unsaveSuccess = false;
        this.saveSuccess = true; }
      else {
        this.saveSuccess = false; 
        this.unsaveSuccess = true;
      }
    } catch (error) {
      console.error('Error save/unsave post:', error);
    }
  }

  async loadFollowedInterestsPosts() {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.posts = await firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/interests-posts`, { headers }));
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
  loadUserDetails() { // פונקציה לטעינת פרטי המשתמש
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${this.apiUrl}/profile`, { headers }).subscribe(
      data => {
        this.currentUserName = data.username;
      },
      error => {
        console.error('Error loading user details:', error);
      }
    );
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
