import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private router: Router, private authService: AuthService) { }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
      location.reload(); // מבצע רענון מלא של הדף לאחר הניווט
    });
  }

  toProfile() {
    this.router.navigate(['profile/:username']).then(() => {
      location.reload();
    });
  }

  toAbout() {
    this.router.navigate(['about']).then(() => {
      location.reload();
    });
  }

  home() {
    this.router.navigate(['home-page']).then(() => {
      location.reload();
    });
  }

  toInterests() {
    this.router.navigate(['interests']).then(() => {
      location.reload();
    });
  }
}
