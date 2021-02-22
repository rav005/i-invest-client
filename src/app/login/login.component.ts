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
  confirmPassword = new FormControl('', Validators.required);

  private resetPasswordToken: string = '';
  enableSecurityQuestion: boolean = false;
  enablePasswordReset: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['']);
    }
  }

  login() {
    this.errorMsg = '';
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
    this.errorMsg = '';
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
    this.errorMsg = '';
    if (this.username.valid) {
      if (this.enableSecurityQuestion && this.secQuestionAns.invalid) {
        this.secQuestionAns.markAsTouched();
        return;
      }
      if (this.enablePasswordReset && (this.password.invalid || this.confirmPassword.invalid) 
      || this.password.value !== this.confirmPassword.value) {
          this.password.markAsTouched();
          this.confirmPassword.markAsTouched();
          return;
      }

      this.auth.passwordReset(this.username.value, this.secQuestionAns.value, this.password.value, this.resetPasswordToken)
        .subscribe((resp: any) => {
          if (resp.question?.length > 0) {
            this.secQuestion.setValue(resp.question);
            this.enableSecurityQuestion = true;
          }
          if (resp.token?.length > 0) {
            this.resetPasswordToken = resp.token;
            this.enableSecurityQuestion = false;
            this.enablePasswordReset = true;
          }
          if (resp.passwordChanged) {
            this.toggleOption('signin');
            this.successMsg = 'Successfully changed password';
          }
        }, (err: any) => {
          console.error('password reset: ', err);
          if (this.resetPasswordToken.length > 0) {
            this.errorMsg = 'Failed to reset password';
          } else {
            this.errorMsg = 'User not found';
          }
        });
    } else {
      this.username.markAsTouched();
    }
  }

  private reset() {
    this.username.reset();
    this.password.reset();
    this.password.setValue('');
    this.secQuestion.reset();
    this.secQuestionAns.reset();
    this.confirmPassword.reset();
    this.confirmPassword.setValue('');
  }

  toggleOption(option: string) {
    this.reset();
    this.errorMsg = '';
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
