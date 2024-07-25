import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface AboutContent {
  description: string;
  members: string[];
  project: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  aboutContent$!: Observable<AboutContent>;
  private apiUrl = 'http://localhost:3000'; // Ensure this matches your proxy configuration

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.aboutContent$ = this.getAboutContent();
  }

  getAboutContent(): Observable<AboutContent> {
    const url = `${this.apiUrl}/about`;
    return this.http.get<AboutContent>(url).pipe(
      catchError(error => {
        console.error('Failed to fetch about content', error);
        return of({ description: '', members: [], project: '' });
      })
    );
  }
}
