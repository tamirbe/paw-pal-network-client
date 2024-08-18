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
import { Router } from '@angular/router';

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

  showConfirmUnfollowPopup: boolean = false; // משתנה לניהול חלון ה-Pop-up
  userToUnfollow: string = ''; // שם המשתמש למחיקה
  deletePassword: string = ''; // משתנה לשמירת הסיסמה לאישור מחיקת חשבון
  showConfirmDeletePopup: boolean = false; // משתנה לניהול חלון ה-Pop-up למחיקת החשבון
  showPasswordMismatchPopup: boolean = false;

  showConfirmDeletePostPopup: boolean = false; // משתנה לניהול חלון ה-Pop-up למחיקת פוסט
  postToDeleteId: string | null = null; // משתנה לשמירת מזהה הפוסט למחיקה
  currentUserName: string = ''; // הוספת משתנה לאחסון שם המשתמש הנוכחי

  usernameExists: boolean = false;
  emailExists: boolean = false;

  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(private sanitizer: DomSanitizer, private fb: FormBuilder, private userService: UserService, private authService: AuthService, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.initForms();
    // Listener for username changes
    this.userForm.get('username')?.valueChanges.subscribe((value) => {
      this.checkUsernameExists(value);
    });

    // Listener for email changes
    this.userForm.get('email')?.valueChanges.subscribe((value) => {
      this.checkEmailExists(value);
    });
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
      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern('^[A-Za-z1-9]+$')]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern('^[A-Za-z]+$')]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern('^[A-Za-z]+$')]],
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

  // מתודות לבדיקה אסינכרונית של שם משתמש ואימייל
  async checkUsernameExists(username: string): Promise<void> {
    if (username === this.user?.username &&!(username===this.currentUserName)) {
      this.usernameExists = false;
      return;
    }

    try {
      const response: any = await firstValueFrom(this.http.post(`${this.apiUrl}/check-username`, { username }));
      this.usernameExists = response === true;
    } catch (error) {
      console.error('Error checking username existence', error);
      this.usernameExists = false;
    }
  }

  async checkEmailExists(email: string): Promise<void> {
    if (email === this.user?.email) {
      this.emailExists = false;
      return;
    }

    try {
      const response: any = await firstValueFrom(this.http.post(`${this.apiUrl}/check-email`, { email }));
      this.emailExists = response === true;
    } catch (error) {
      console.error('Error checking email existence', error);
      this.emailExists = false;
    }
  }

  // Handle form submissions
  async onSubmitUserDetails(): Promise<void> {
    // Reset existing error messages
    this.usernameExists = false;
    this.emailExists = false;

    const username = this.userForm.get('username')?.value;
    const email = this.userForm.get('email')?.value;

    // Check if username or email already exists
    await this.checkUsernameExists(username);
    await this.checkEmailExists(email);

    // If form is invalid or username/email already exists, stop submission
    if (this.userForm.invalid || this.usernameExists || this.emailExists) {
      console.error('Form is invalid or username/email already exists');

      // Set all fields as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach(field => {
        const control = this.userForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });

      return; // Stop the form submission if there are errors
    }

    // If no errors, proceed to send the update request
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    try {
      const response = await firstValueFrom(this.http.put(`${this.apiUrl}/user-details`, this.userForm.value, { headers, responseType: 'text' }));
      console.log('User details updated successfully');
      // Redirect the user back to the personal-area page
      this.editMode = false;
      this.loadUserData();
      this.uploadMode = true;
    } catch (error: any) {
      console.error('Error updating user details', error);
      // Handle other errors as necessary
    }
  }



  onSubmitPasswordChange(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword }, { headers, responseType: 'text' }).pipe(
        catchError(error => {
          if (error.status === 400) {
            // wrong currentPassword
            this.passwordForm.get('currentPassword')?.setErrors({ invalidCurrentPassword: true });
          }
          return [];
        })
      ).subscribe(response => {
        if (response) {
          // console.log("Password changed successfully, response:", response);
          this.cancelAction();
          // this.router.navigate(['/personal-area']);
        } else {
          console.error("Unexpected response:", response);
        }
      });
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

  uploadModeonly(): void {
    this.deleteMode = false;
    this.passwordMode = false;
    this.editMode = false;
    this.favoriteMode = false;
    this.uploadMode = true;
    this.savedMode = false;
    this.statsMode = false;
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

  showFollowing(): void {
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
  confirmUnfollowUser(username: string): void {
    this.showConfirmUnfollowPopup = true;
    this.userToUnfollow = username;
  }

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
    this.showConfirmUnfollowPopup = false;
    this.showFollowing();
    this.showFollowing();
  }

  cancelUnfollow(): void {
    this.showConfirmUnfollowPopup = false;
    this.userToUnfollow = '';
  }

  // Remove uploaded content
  removeUploadedContent(contentId: string): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`${this.apiUrl}/uploaded-content/${contentId}`, { headers }).pipe(
      switchMap(() => {
        console.log(`Post with ID ${contentId} deleted from server.`);
        return this.http.get<any[]>(`${this.apiUrl}/uploaded-content`, { headers });
      }),
      catchError(error => {
        console.error('Error removing content:', error);
        console.log(contentId);
        return [];
      })
    ).subscribe(data => {
      this.uploadedContent = data;
      console.log('Updated uploaded content:', this.uploadedContent);
    });
  }

  // פונקציה להצגת ה-Pop-up למחיקת פוסט
  confirmDeletePost(postId: string): void {
    this.postToDeleteId = postId;
    this.showConfirmDeletePostPopup = true;
  }

  // פונקציה לביצוע מחיקת הפוסט לאחר אישור
  deletePostConfirmed(): void {
    if (!this.postToDeleteId) {
      console.error('Post ID is missing, cannot delete the post.');
      return;
    }
    console.log(`Deleting post with ID: ${this.postToDeleteId}`);
    this.removeUploadedContent(this.postToDeleteId);
    this.showConfirmDeletePostPopup = false;
    this.postToDeleteId = null;
    this.loadUploadedContent();
  }

  // פונקציה לביטול המחיקה אם המשתמש בחר "No"
  cancelDeletePost(): void {
    this.postToDeleteId = null;
    this.showConfirmDeletePostPopup = false;
  }

  logout() {
    this.authService.logout();
  }

  closePasswordMismatchPopup(): void {
    this.showPasswordMismatchPopup = false;
  }

  // Confirm and cancel actions for account deletion
  confirmDeleteAccount(): void {
    this.showConfirmDeletePopup = true;
  }

  deleteAccountConfirmed(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const currentPassword = (document.querySelector('.password-input') as HTMLInputElement).value;

    const body = { password: currentPassword };

    this.http.post(`${this.apiUrl}/delete-account`, body, { headers, responseType: 'text' }) // הוספת responseType: 'text'
      .pipe(
        catchError(error => {
          console.error('Error deleting account:', error);
          if (error.status === 400) {
            this.showConfirmDeletePopup = false;
            this.showPasswordMismatchPopup = true;
          }
          return [];
        })
      ).subscribe(response => {
        if (response === 'Account deleted') {
          this.showConfirmDeletePopup = false;
          this.router.navigate(['login']);
        }
      });
  }


  cancelDeleteAccount(): void {
    this.showConfirmDeletePopup = false;
    this.cancelAction();
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
