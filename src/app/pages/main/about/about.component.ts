import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  submitters: string[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getSubmitters().subscribe(submitters => {
      this.submitters = submitters;
    });
  }
}
