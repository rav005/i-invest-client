import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  signIn: boolean = true;
  signupOption: boolean = false;
  forgetPassword: boolean = false;

  username = new FormControl('', Validators.required);
  password = new FormControl('', Validators.required);
  secQuestion = new FormControl('', Validators.required);
  secQuestionAns = new FormControl('', Validators.required);

  enableSecurityQuestion: boolean = false;
  errorMsg: string | null = null;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['']);
    }
  }

  login() {
    this.errorMsg = null;
    if (this.username.valid && this.password.valid) {
      this.auth.login(this.username.value, this.password.value)
        .subscribe(resp => {
          if (resp) {
            this.router.navigate(['']);
          } else {
            this.errorMsg = 'Invalid username/password';
          }
        }, err => {
          if (err?.error?.error) {
            this.errorMsg = err.error.error;
          } else {
            this.errorMsg = 'Invalid username/password';
          }
        });
    } else {
      this.username.markAsTouched();
      this.password.markAsTouched();
      this.password.setValue('');
    }
  }
  
  signup() {
    this.errorMsg = null;
    if (this.username.valid && this.password.valid && this.secQuestion.valid && this.secQuestionAns.valid) {
      this.auth.signup(this.username.value, this.password.value, this.secQuestion.value, this.secQuestionAns.value)
        .subscribe(resp => {
          if (resp) {
            this.router.navigate(['']);
          } else {
            this.errorMsg = 'Failed to create account';
          }
        }, err => {
          this.errorMsg = 'Failed to create account';
          console.log('signup error: ', err);
        });
    } else {
      this.username.markAsTouched();
      this.password.markAsTouched();
      this.password.setValue('');
      this.secQuestion.markAsTouched();
      this.secQuestionAns.markAsTouched();
    }
  }

  processForgetPassword() {
    if (this.username.valid) {
      
    } else {
      this.username.markAsTouched();
    }
  }

  private reset() {
    this.username.reset();
    this.password.reset();
    this.secQuestion.reset();
    this.secQuestionAns.reset();
  }

  toggleOption(option: string) {
    this.reset();
    this.errorMsg = null;
    if (option === 'signin') {
      this.signIn = true;
      this.signupOption = false;
      this.forgetPassword = false;
    } else if (option === 'forgetpassword') {
      this.signIn = false;
      this.signupOption = false;
      this.forgetPassword = true;
    } else if (option === 'signup') {
      this.signIn = false;
      this.signupOption = true;
      this.forgetPassword = false;
    }
  }

}
