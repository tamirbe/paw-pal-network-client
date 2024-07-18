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
  }
  toProfile() {
    this.router.navigate(['profile']);
  }
  toAbout() {
    this.router.navigate(['about']);
  }
  home() {
    this.router.navigate(['home-page']);
  }
}
