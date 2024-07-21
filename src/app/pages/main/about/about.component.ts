import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  description: string = '';
  members: string[] = [];
  project: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getAboutContent().subscribe(content => {
      this.description = content.description;
      this.members = content.members;
      this.project = content.project;
    });
  }
}
