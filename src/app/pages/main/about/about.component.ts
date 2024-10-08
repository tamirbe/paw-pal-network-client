import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth.service';

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
  messageForm!: FormGroup;
  messageSent: boolean = false;
  currentUserName: string = ''; 
  private apiUrl = 'https://paw-pal-network-server.onrender.com'; // Adjust this to your backend URL

  constructor(private http: HttpClient, private fb: FormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadUserDetails(); 
  }


  initForm() {
    this.messageForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  loadUserDetails() { 
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${this.apiUrl}/profile`, { headers }).subscribe(
      data => {
        this.currentUserName = data.username;
        this.messageForm.patchValue({ name: this.currentUserName }); // Update the form
      },
      error => {
        console.error('Error loading user details:', error);
      }
    );
  }

  onSubmit() {
    if (this.messageForm.valid) {
      const messageData = this.messageForm.value;
      this.http.post(`${this.apiUrl}/contact`, messageData).subscribe(
        response => {
          console.log('Message sent successfully', response);
          this.messageForm.reset();
          this.messageSent = true;
        },
        error => {
          console.error('Error sending message', error);
          if (error.status === 200) { // Adding check for status 200
            this.messageForm.reset();
            this.messageSent = true;
          }
        }
      );
    }
  }
}
