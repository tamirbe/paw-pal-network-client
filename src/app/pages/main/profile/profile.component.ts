import { Component, OnInit } from '@angular/core';
import { UserService } from './userService';
import { User } from './user.model'; // Import the User interface
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user?: User | null;
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

  constructor(private fb: FormBuilder, private userService: UserService) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
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
    this.userService.getUserProfile().subscribe(data => {
      this.user = data;
      this.userForm.patchValue(data);
    });

    this.loadUserFollowing();
    this.loadUploadedContent();
    this.loadFavoriteContent();
    this.loadSavedContent();
  }

  private loadUserFollowing(): void {
    this.userService.getUserFollowing().subscribe(data => {
      this.following = data;
      this.filteredFollowing = [...data];
    });
  }

  private loadUploadedContent(): void {
    this.userService.getUploadedContent().subscribe(data => this.uploadedContent = data);
  }

  private loadFavoriteContent(): void {
    this.userService.getFavoriteContent().subscribe(data => this.favoriteContent = data);
  }

  private loadSavedContent(): void {
    this.userService.getSavedContent().subscribe(data => this.savedContent = data);
  }

  goToUserProfile(username: string) {
    // Implement navigation or logic to view user profile
    console.log(`Navigating to profile of ${username}`);
  }

  // Search functionality for following users
  searchFollowing(query: string) {
    this.filteredFollowing = this.following.filter(user =>
      user.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Handle form submissions
  onSubmitUserDetails(): void {
    if (this.userForm.valid) {
      this.userService.updateUserProfile(this.userForm.value).pipe(
        switchMap(() => this.userService.getUserProfile()),
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
      this.userService.changeUserPassword(currentPassword, newPassword).pipe(
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

  // Unfollow user
  unfollowUser(username: string): void {
    this.userService.unfollowUser(username).pipe(
      switchMap(() => this.userService.getUserFollowing()),
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
    this.userService.removeUploadedContent(contentId).pipe(
      switchMap(() => this.userService.getUploadedContent()),
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
    this.userService.deleteAccount().pipe(
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
