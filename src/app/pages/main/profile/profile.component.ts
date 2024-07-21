import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private apiUrl = 'http://localhost:3000'; // Ensure this matches your proxy configuration

  constructor() { }

  ngOnInit(): void {
  }

  //getUserDetails(): { }
}
