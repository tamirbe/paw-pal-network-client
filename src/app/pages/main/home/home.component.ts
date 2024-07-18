import { Component } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  posts = [
    { image: 'assets/../../../../assets/images/fourp.png', description: 'Enjoying a sunny day at the park!' },
    { image: '../../../../assets/images/fourp.png', description: 'Curious kitty exploring the garden.' },
    { image: '../../../../assets/images/fourp.png', description: 'Playing fetch with my best friend.' },
    { image: '../../../../assets/images/fourp.png', description: 'Napping in my favorite spot.' }
  ];

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
