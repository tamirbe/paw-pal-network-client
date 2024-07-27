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
  shared: boolean;
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
  currentUser: string = ''; // הוסף משתנה לשם המשתמש הנוכחי
  currentUserFirstName: string = ''; // הוסף משתנה לשם המשתמש הנוכחי

  postToDelete: Post | null = null; // משתנה לשמירת הפוסט למחיקה
  editingPost: Post | null = null;
  editSuccess: boolean = false;
  selectedFile: File | null = null; // משתנה לשמירת הקובץ


  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(private sanitizer: DomSanitizer,private router: Router, private authService: AuthService, private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.postForm = this.fb.group({
      description: ['', Validators.required],
      image: [null]
    });
    this.loadFeed();
    this.setCurrentUser(); 
  }

  async loadFeed() {
    try {
      const token = this.authService.getToken();
      console.log('Sending request to /feed with token:', token);
  
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.posts = await firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/posts`, { headers }));
      
      this.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('Posts loaded:', this.posts);
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  setCurrentUser() {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = this.parseJwt(token);
      console.log('Decoded token:', decodedToken); // הצגת כל התוכן של הטוקן
      this.currentUser = decodedToken.username; 
      this.currentUserFirstName = decodedToken.firstName;
      console.log('Current user:', this.currentUser); 
      console.log('Current user first name:', this.currentUserFirstName); 
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


  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file; // שמירת הקובץ במשתנה
  }

  async onSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('description', this.postForm.get('description')?.value);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile); // הוספת הקובץ ל-FormData
    }

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


  onTextAreaInput(event: any): void {
    const text = event.target.value;
    const isHebrew = /[\u0590-\u05FF]/.test(text);
    if (isHebrew) {
      event.target.style.direction = 'rtl';
    } else {
      event.target.style.direction = 'ltr';
    }
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
        // Unlike post
        await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/unlike`, {}, { headers }));
        post.liked = false;
        post.likes = post.likes.filter(like => like !== this.currentUser);
      } else {
        // Like post
        await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/like`, {}, { headers }));
        post.liked = true;
        post.likes.push(this.currentUser);
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  }
  

async sharePost(post: Post) {
  try {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        
    if (post.shared) {
      // Unshare post
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/unshare`, {}, { headers }));
      post.shared = false;
      post.shares = post.shares.filter(share => share !== this.currentUser); // Remove the current user from the shares array
    } else {
      // Share post
      const sharedPost: Post = await firstValueFrom(this.http.post<Post>(`${this.apiUrl}/posts/${post._id}/share`, {}, { headers }));
      post.shared = true;
      post.shares.push('shared'); // Add the current user to the shares array
      this.posts.push(sharedPost); // Add the new shared post to the list
    }
    //await this.loadFeed(); // Reload feed after successful share/unshare
  } catch (error) {
    console.error('Error sharing/unsharing post:', error);
  }
}

  
  async savePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/save`, {}, { headers }));
      post.savedBy.push('saved'); // This assumes you have a savedBy array in your Post model
      console.log('Post saved:', post);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  }

  editPost(post: Post) {
    this.editingPost = { ...post };  // Clone post to avoid modifying original object
  }

  // Save edit function
  async saveEdit() {
    if (!this.editingPost) return;

    // יצירת הפוסט מחדש עם הפרטים הערוכים
    const formData = new FormData();
    formData.append('description', this.editingPost.description);
    formData.append('image', this.postForm.get('image')?.value);
    
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        
      // מחיקה של הפוסט הקודם
      await firstValueFrom(this.http.delete(`${this.apiUrl}/posts/${this.editingPost._id}`, { headers }));

      await firstValueFrom(this.http.post(`${this.apiUrl}/posts`, formData, { headers }));
      this.editSuccess = true;
      this.editingPost = null;
      await this.loadFeed();
    } catch (error) {
      console.error('Error editing post:', error);
    }
  }
    
  removeImage() {
    this.postForm.patchValue({ image: null });  // Clear the file input value
    this.saveEdit();
  }
  
  // Cancel edit function
  cancelEdit() {
    this.editingPost = null;
  }
  
  // Close success dialog
  closeSuccessDialog() {
    this.editSuccess = false;
  }

  confirmDelete(post: Post) {
    this.postToDelete = post;
  }

  cancelDelete() {
    this.postToDelete = null; 
  }

  async deletePost(post: Post) {
    if (!post) {
      return;
    }

    try {
      console.log('Starting delete process for post:', post._id); 
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.delete(`${this.apiUrl}/posts/${post._id}`, { headers }));
      console.log('Post deleted successfully');
      this.posts = this.posts.filter(p => p._id !== post._id); // Remove the post from the list after deletion
      this.postToDelete = null;
    } catch (error) {
      console.error('Error deleting post:', error);
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