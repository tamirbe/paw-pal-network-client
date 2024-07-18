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
  registerForm!: FormGroup;
  isRegister: boolean = true;
  registrationFailed: boolean = false;


  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8), Validators.maxLength(20),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*].{8,}$')
      ]],
    });
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8), Validators.maxLength(20),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*].{8,}$')
      ]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
    });

  }

  toRegister() {
    this.isRegister = !this.isRegister
  }

  onLoginSubmit() {
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
  onRegisterSubmit() {
    if (this.registerForm.valid) {
      const { username, firstName, lastName, email, password, dateOfBirth } = this.registerForm.value;
      this.authService.register(username, firstName, lastName, email, password, dateOfBirth).subscribe(success => {
        if (!success) {
          this.registrationFailed = true;
        } else {
          this.toRegister(); // Switch back to login view after successful registration
        }
      });
    }
  }
}
