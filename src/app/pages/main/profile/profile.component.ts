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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user?: User | null;
  post?: Post | null;
  following: string[] = [];
  filteredFollowing: string[] = [];
  uploadedContent: any[] = [];
  favoriteContent: any[] = [];
  savedContent: any[] = [];
  showMenu: boolean = false;
  editMode: boolean = false;
  passwordMode: boolean = false;
  deleteMode: boolean = false;
  statsMode: boolean = false;
  userForm!: FormGroup; // Form for personal details
  passwordForm!: FormGroup; // Form for password change

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
      pet: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: ProfileComponent.passwordMatchValidator });
  }

  // Validator to ensure new and confirm passwords match
  private static passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
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

    this.http.get<any[]>(`${this.apiUrl}/following`, { headers }).subscribe(data => {
      this.following = data;
    });
  }

  private loadUploadedContent(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`${this.apiUrl}/uploaded-content`, { headers }).subscribe(
      data => {
        this.uploadedContent = data;
      });
  }

  private loadFavoriteContent(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`${this.apiUrl}/favorite-content`, { headers }).subscribe(
      data => {
        this.favoriteContent = data;
      });
  }

  private loadSavedContent(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`${this.apiUrl}/saved-content`, { headers }).subscribe(data => this.savedContent = data);
  }

  goToUserProfile(username: string) {
    // Implement navigation or logic to view user profile
    console.log(`Navigating to profile of ${username}`);
  }

  // Search functionality for following users
  searchFollowing(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.filteredFollowing = this.following.filter(user =>
      user.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Handle form submissions
  onSubmitUserDetails(): void {
    if (this.userForm.valid) {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.put(`${this.apiUrl}/profile`, this.userForm.value, { headers }).pipe(
        switchMap(() => this.http.get<User>(`${this.apiUrl}/profile`, { headers })),
        catchError(error => {
          console.error('Error updating user profile:', error);
          return [];
        })
      ).subscribe(data => {
        this.user = data;
        console.log('User profile updated successfully');
        this.editMode = false;
      });
    } else {
      console.error('User details form is invalid');
    }
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
        this.passwordForm.reset();
        this.passwordMode = false;
      });
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
  }

  changePassword(): void {
    this.passwordMode = true;
  }

  deleteAccount(): void {
    this.deleteMode = true;
  }

  viewStatistics(): void {
    this.statsMode = true;
  }

  savedPosts(): void {
    this.loadSavedContent();
  }

  favoritePosts(): void {
    this.loadFavoriteContent();
  }

  // Unfollow user
  unfollowUser(username: string): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`${this.apiUrl}/unfollow`, { username }, { headers }).pipe(
      switchMap(() => this.http.get<string[]>(`${this.apiUrl}/following`, { headers })),
      catchError(error => {
        console.error('Error unfollowing user:', error);
        return [];
      })
    ).subscribe(data => {
      this.following = data;
      this.filteredFollowing = [...data];
      console.log(`Unfollowed ${username}`);
    });
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
  }
}
