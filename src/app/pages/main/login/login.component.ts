import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginFailed: boolean = false;
  loginForm!: FormGroup;
  isRegister: boolean = false;


  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  toRegister() {
    this.isRegister = !this.isRegister
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe(success => {
        if (!success) {
          this.loginFailed = true;
        } else {
          this.router.navigate(['home-page']);
        }
      });
    }
  }
}
