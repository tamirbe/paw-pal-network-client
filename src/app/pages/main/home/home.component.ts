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
  shares: { user: string, text: string, createdAt: Date }[];
  saves: string[];
  saved: boolean;
  liked: boolean;
  shared: boolean;
  systemPost?: boolean;
  sharedText?: string;
  sharedAt?: Date;
  sharedBy?: { firstName: string, lastName: string };
}
interface Share {
  user: string;
  text: string;
  createdAt: Date;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
  
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  postForm!: FormGroup;
  searchQuery: string = '';
  currentUser: string = '';
  currentUserFirstName: string = '';
  currentUserLastName: string = '';
  postToDelete: Post | null = null;
  editingPost: Post | null = null;
  editSuccess: boolean = false;
  saveSuccess: boolean = false;
  unsaveSuccess: boolean = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;


  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

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
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      const [userPosts, sharedPosts] = await Promise.all([
        firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/feed`, { headers })),
        this.loadSharedPosts(headers)
      ]);
  
      const systemPosts: Post[] = [
        {
          description: 'Welcome to our platform! Stay tuned for updates.',
          author: { username: 'system', firstName: 'System', lastName: '' },
          createdAt: new Date(),
          likes: [],
          shares: [],
          saves: [],
          saved: false,
          liked: false,
          shared: false,
          systemPost: true
        },
        // הוסף פוסטים נוספים של המערכת כאן
      ];
      this.posts = [...systemPosts, ...userPosts, ...sharedPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('Posts loaded:', this.posts);
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  }

  async loadSharedPosts(headers: HttpHeaders): Promise<Post[]> {
    try {
      const sharedPosts = await firstValueFrom(this.http.get<Post[]>(`${this.apiUrl}/share`, { headers }));
      return sharedPosts.map(post => {
        const shareDetails = post.shares.find(share => share.user === this.currentUser);
        
        return {
          ...post,
          sharedText: shareDetails ? shareDetails.text : '',
          sharedAt: shareDetails ? new Date(shareDetails.createdAt) : undefined,
          sharedBy: {
            firstName: 'ssd',
            lastName: 'this.currentUserLastName'
          }
        };
      });
    } catch (error) {
      console.error('Error loading shared posts:', error);
      return [];
    }
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  setCurrentUser() {
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = this.parseJwt(token);
      this.currentUser = decodedToken.username; 
      this.currentUserFirstName = decodedToken.firstName;
      this.currentUserLastName = decodedToken.lastName;
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
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.postForm.patchValue({
        image: file
      });
      // Mark the field as touched to trigger validation
      this.postForm.get('image')?.markAsTouched();
    }
  }

  async onSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('description', this.postForm.get('description')?.value);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const response = await firstValueFrom(this.http.post(`${this.apiUrl}/posts`, formData, { headers }));
      this.loadFeed();
      this.resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  resetForm() {
    this.postForm.reset();
    this.selectedFile = null;
    this.selectedFileName = null;
  }

  onTextAreaInput(event: any): void {
    const text = event.target.value;
    const isHebrew = /[\u0590-\u05FF]/.test(text);
    event.target.style.direction = isHebrew ? 'rtl' : 'ltr';
  }

  getTextDirection(text: string): string {
    return /[\u0590-\u05FF]/.test(text) ? 'rtl' : 'ltr';
  }

  async likePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      if (post.liked) {
        post.liked = false;
        post.likes = post.likes.filter(like => like !== this.currentUser);
      } else {
        post.liked = true;
        post.likes.push(this.currentUser);
      }
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/like`, {}, { headers }));

    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  }

  async sharePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        
      const sharedPost: Post = await firstValueFrom(this.http.post<Post>(`${this.apiUrl}/posts/${post._id}/share`, {}, { headers }));

      this.posts.push(sharedPost); 
      this.loadFeed();
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

  editPost(post: Post) {
    this.editingPost = { ...post };
  }

  async saveEdit() {
    if (!this.editingPost) return;

    const formData = new FormData();
    formData.append('description', this.editingPost.description);
    formData.append('image', this.postForm.get('image')?.value);
    
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        
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
    this.postForm.patchValue({ image: null });
  }

  cancelEdit() {
    this.editingPost = null;
  }

  closeSuccessDialog() {
    this.editSuccess = false;
  }


  closeSaveSuccessDialog() { // חדש: סגירת דיאלוג הצלחה של שמירת פוסט
    this.saveSuccess = false;
  }


  closeUnsaveSuccessDialog() {
    this.unsaveSuccess = false;
  }

  confirmDelete(post: Post) {
    this.postToDelete = post;
  }

  cancelDelete() {
    this.postToDelete = null;
  }



// פונקציה להסרת שיתוף
async confirmUnshare(post: Post, userId: string, createdAt: Date) {
  if (!post || !userId || !createdAt) {
    return;
  }

  try {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    await firstValueFrom(this.http.delete(`${this.apiUrl}/Unshare/${post._id}/${userId}/${createdAt}`, { headers }));
    console.log('Share deleted successfully');
    
    // עדכון רשימת השיתופים בלוקלי
    post.shares = post.shares.filter(s => s.user !== userId || new Date(s.createdAt).getTime() !== new Date(createdAt).getTime());
    
    this.postToDelete = null;
  } catch (error) {
    console.error('Error deleting share:', error);
  }
  this.loadFeed();

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
      this.posts = this.posts.filter(p => p._id !== post._id);
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
