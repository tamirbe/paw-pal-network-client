import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private router: Router, private authService: AuthService) { }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toProfile() {
    this.reloadCurrentRoute('profile/:username');
  }

  toAbout() {
    this.reloadCurrentRoute('about');
  }

  home() {
    this.reloadCurrentRoute('home-page');
  }

  toInterests() {
    this.reloadCurrentRoute('interests');
  }

  private reloadCurrentRoute(route: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([route]);
    });
  }
}
