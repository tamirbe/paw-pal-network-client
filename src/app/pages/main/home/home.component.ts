import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface Post {
  _id?: string;
  image?: string;
  description: string;
  author: { username: string, firstName: string, lastName: string };
  createdAt: Date;
  likes: string[];
  shares: string[];
  savedBy: string[];
  liked: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  postForm!: FormGroup;
  searchQuery: string = ''; // add

  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(private sanitizer: DomSanitizer,private router: Router, private authService: AuthService, private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.postForm = this.fb.group({
      description: ['', Validators.required],
      image: [null]
    });
    this.loadFeed();
  }

  async loadFeed() {
    try {
      const token = this.authService.getToken();
      console.log('Sending request to /feed with token:', token);
  
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.posts = await firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/posts`, { headers }));
      
      console.log('Posts loaded:', this.posts);
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.postForm.patchValue({ image: file });
  }

  async onSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('description', this.postForm.get('description')?.value);
    formData.append('image', this.postForm.get('image')?.value);

    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const response = await firstValueFrom(this.http.post(`${this.apiUrl}/posts`, formData, { headers }));
      console.log('Success:', response);
      this.loadFeed(); // Reload feed after successful submission
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async likePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/like`, {}, { headers }));
      post.liked = !post.liked;
      if (post.liked) {
        post.likes.push('liked');
      } else {
        post.likes.pop();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }

  async sharePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/share`, {}, { headers }));
      post.shares.push('shared');
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  }

  async savePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/save`, {}, { headers }));
      post.savedBy.push('saved');
    } catch (error) {
      console.error('Error saving post:', error);
    }
  }

  logout() {
    this.authService.logout();
  }

  toProfile() {
    this.router.navigate(['profile/:username']);
  }

  toAbout() {
    this.router.navigate(['about']);
  }

  home() {
    this.router.navigate(['home-page']);
  }

  onSearch() {
    this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
  }
}
