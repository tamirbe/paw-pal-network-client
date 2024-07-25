import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { firstValueFrom } from 'rxjs'; // add

interface User {
  username: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  users: User[] = [];
  private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const query = params['query'];
      this.searchUsers(query);
    });
  }

  async searchUsers(query: string) {
    if (query) {
      try {
        const token = this.authService.getToken();
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.users = await firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/search`, { headers, params: { query } }));
        console.log('Search results:', this.users);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }
  }
}
