import { Component, OnInit } from '@angular/core';
import { UserService } from './userService';
import { User } from './user.model'; // Import the User interface
import { Post } from './post.model'; // Import the Post interface
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user?: User | null;
  post?: Post | null;
  postToDelete: Post | null = null; // משתנה לשמירת הפוסט למחיקה
  following: string[] = [];
  filteredFollowing: string[] = [];
  searchTerm: string = '';
  uploadedContent: any[] = [];
  favoriteContent: any[] = [];
  savedContent: any[] = [];
  sortedContent: any[] = [];
  sortOption: string = 'date';
  showMenu: boolean = false;
  editMode: boolean = false;
  passwordMode: boolean = false;
  deleteMode: boolean = false;
  statsMode: boolean = false;
  uploadMode: boolean = true;
  savedMode: boolean = false;
  favoriteMode: boolean = false;
  followMode: boolean = false;
  petOptions: string[] = ['Dog', 'Cat', 'Bird', 'Fish', 'Hamster', 'Rabbit', 'Guniea Pig', 'Turtle', 'Snake', 'Lizard', 'No Pets'];
  userForm!: FormGroup; // Form for personal details
  passwordForm!: FormGroup;
  hide = true;// Form for password change

  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(private sanitizer: DomSanitizer, private fb: FormBuilder, private userService: UserService, private authService: AuthService, private http: HttpClient) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }

  getTextDirection(text: string): string {
    const isHebrew = /[\u0590-\u05FF]/.test(text);
    return isHebrew ? 'rtl' : 'ltr';
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }


  // Initialize the forms
  private initForms(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pet: ['No Pets']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8), Validators.maxLength(20),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*].{8,}$')
      ]],
      confirmPassword: ['', Validators.required]
    });
  }

  // Validator to ensure new and confirm passwords match
  private static passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  // Load user profile and related data
  private loadUserData(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<User>(`${this.apiUrl}/profile`, { headers }).subscribe(data => {
      this.user = data;
      this.userForm.patchValue(data);
    });

    this.loadUserFollowing();
    this.loadUploadedContent();
  }

  private loadUserFollowing(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{ following: string[] }>(`${this.apiUrl}/current-user-following`, { headers }).subscribe(
      data => {
        this.following = data.following;
        this.filteredFollowing = data.following;
      },
      error => {
        console.error('Error loading following users:', error);
      }
    );
  }

  private loadUploadedContent(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`${this.apiUrl}/uploaded-content`, { headers }).subscribe(
      data => {
        this.uploadedContent = data;
        this.sortedContent = this.sortPosts(this.uploadedContent, this.sortOption);
      });
  }

  private loadFavoriteContent(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`${this.apiUrl}/favorite-content`, { headers }).subscribe(
      data => {
        this.favoriteContent = data;
        console.log(data);
        this.sortedContent = this.sortPosts(this.favoriteContent, this.sortOption);

      });
  }

  private loadSavedContent(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`${this.apiUrl}/saved-content`, { headers }).subscribe(
      data => {
        this.savedContent = data;
        console.log(data);
        this.sortedContent = this.sortPosts(this.savedContent, this.sortOption);

      });

  }

  goToUserProfile(username: string) {
    // Implement navigation or logic to view user profile
    console.log(`Navigating to profile of ${username}`);
  }

  // Search functionality for following users
  filterFollowing(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredFollowing = this.following;
    } else {
      this.filteredFollowing = this.following.filter(username => 
        username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  // Handle form submissions
  onSubmitUserDetails(): void {
    if (this.userForm.invalid) {
      return;
    }

    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`${this.apiUrl}/user-details`, this.userForm.value, { headers }).subscribe(
      response => {
        console.log('User details updated successfully');
        // Handle success
        this.editMode = false;
        this.loadUserData();
        this.uploadMode = true;
      },
      error => {
        console.error('Error updating user details', error);
        // Handle error
      }
    );
    window.location.reload();
  }

  onSubmitPasswordChange(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword }, { headers }).pipe(
        catchError(error => {
          console.error('Error changing password:', error);
          return [];
        })
      ).subscribe(() => {
        console.log('Password changed successfully');
      });
      this.passwordMode = false;
      this.loadUserData();
      this.uploadMode = true;
      this.passwordForm.reset();
    } else {
      console.error('Password form is invalid');
    }
  }

  // Menu toggle
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  // Mode toggles
  editPersonalDetails(): void {
    this.editMode = true;
    this.favoriteMode = false;
    this.uploadMode = false;
    this.savedMode = false;
    this.statsMode = false;
    this.deleteMode = false;
    this.passwordMode = false;
    this.followMode = false;
  }

  changePassword(): void {
    this.passwordMode = true;
    this.editMode = false;
    this.favoriteMode = false;
    this.uploadMode = false;
    this.savedMode = false;
    this.statsMode = false;
    this.deleteMode = false;
    this.followMode = false;
  }

  deleteAccount(): void {
    this.deleteMode = true;
    this.passwordMode = false;
    this.editMode = false;
    this.favoriteMode = false;
    this.uploadMode = false;
    this.savedMode = false;
    this.statsMode = false;
    this.followMode = false;
  }

  viewStatistics(): void {
    this.statsMode = true;
    this.deleteMode = false;
    this.passwordMode = false;
    this.editMode = false;
    this.favoriteMode = false;
    this.uploadMode = false;
    this.savedMode = false;
    this.followMode = false;
  }

  savedPosts(): void {
    this.savedMode = true;
    this.statsMode = false;
    this.deleteMode = false;
    this.passwordMode = false;
    this.editMode = false;
    this.favoriteMode = false;
    this.uploadMode = false;
    this.followMode = false;
    this.loadSavedContent();
  }

  favoritePosts(): void {
    this.favoriteMode = true;
    this.savedMode = false;
    this.statsMode = false;
    this.deleteMode = false;
    this.passwordMode = false;
    this.editMode = false;
    this.uploadMode = false;
    this.followMode = false;
    this.loadFavoriteContent();
  }

  showFollowing(): void{
    this.favoriteMode = false;
    this.savedMode = false;
    this.statsMode = false;
    this.deleteMode = false;
    this.passwordMode = false;
    this.editMode = false;
    this.uploadMode = false;
    this.followMode = true;
    this.loadUserFollowing();
  }

  sortPosts(contentArray: any[], option: string): any[] {
    console.log(contentArray);
    this.sortOption = option;
    let sortedArray = [];
    if (option === 'likes') {
      sortedArray = [...contentArray].sort((a, b) => b.likes.length - a.likes.length);
      console.log(sortedArray)
    } else {
      sortedArray = [...contentArray].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    console.log(sortedArray)
    return sortedArray;
  }

  // Unfollow user
  unfollowUser(username: string): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`${this.apiUrl}/unfollow`, { username }, { headers }).pipe(
      switchMap(() => this.http.get<string[]>(`${this.apiUrl}/current-user-following`, { headers })),
      catchError(error => {
        console.error('Error unfollowing user:', error);
        return ([]);
      })
    ).subscribe(data => {
      this.following = data;
      this.filteredFollowing = [...data];
      console.log(`Unfollowed ${username}`);
    });
    this.showFollowing();
    this.showFollowing();

  }

  // Remove uploaded content
  removeUploadedContent(contentId: string): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`${this.apiUrl}/uploaded-content/${contentId}`, { headers }).pipe(
      switchMap(() => this.http.get<any[]>(`${this.apiUrl}/uploaded-content`, { headers })),
      catchError(error => {
        console.error('Error removing content:', error);
        return [];
      })
    ).subscribe(data => {
      this.uploadedContent = data;
      console.log(`Removed content with ID ${contentId}`);
    });
  }

  // Confirm and cancel actions
  confirmDeleteAccount(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`${this.apiUrl}/delete-account`, { headers }).pipe(
      catchError(error => {
        console.error('Error deleting account:', error);
        return [];
      })
    ).subscribe(() => {
      console.log('Account deleted successfully');
      // Handle post-deletion logic
    });
  }

  cancelAction(): void {
    this.editMode = false;
    this.passwordMode = false;
    this.deleteMode = false;
    this.statsMode = false;
    this.savedMode = false;
    this.favoriteMode = false;
    this.followMode = false;
    this.uploadMode = true;
  }

  cancelEdit(): void {
    this.loadUserData();
    this.cancelAction();
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
      this.uploadedContent = this.uploadedContent.filter(p => p._id !== post._id); // Remove the post from the list after deletion
      this.postToDelete = null;
    } catch (error) {
      console.error('Error deleting post:', error);
    }
    this.loadUploadedContent();
  }

  
  async unsavePost(post: Post) {
    if (!post) {
      return;
    }
  
    try {
      console.log('Starting unsave process for post:', post._id);
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/save`, {}, { headers }));
      console.log('Post unsaved successfully');
      this.savedContent = this.savedContent.filter(p => p._id !== post._id); // Remove the post from the saved list
    } catch (error) {
      console.error('Error unsaving post:', error);
    }
    this.loadSavedContent();
  }

  async UnlikePost(post: Post) {
    try {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      await firstValueFrom(this.http.post(`${this.apiUrl}/posts/${post._id}/like`, {}, { headers }));

    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
    this.favoritePosts();
  }
}
