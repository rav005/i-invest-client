import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
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

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
  }

  login() {
    if (this.username.valid && this.password.valid) {
      this.auth.login(this.username.value, this.password.value)
        .subscribe(resp => {
          console.log('data resp: ', resp);
          return resp;
        }, err => {
          console.error('err: ', err);
          return err;
        });
    } else {
      this.username.markAsTouched();
      this.password.markAsTouched();
      this.password.setValue('');
    }
  }
  
  signup() {
    console.log(`${this.username.value}: ${this.password.value}\n${this.secQuestion.value}: ${this.secQuestionAns.value}`);
    if (this.username.valid && this.password.valid && this.secQuestion.valid && this.secQuestionAns.valid) {
      this.auth.signup(this.username.value, this.password.value, this.secQuestion.value, this.secQuestionAns.value)
        .subscribe(resp => {
          console.log('signup resp: ', resp);
          return resp;
        }, err => {
          console.error('err: ', err);
          return err;
        });
    } else {
      this.username.markAsTouched();
      this.password.markAsTouched();
      this.password.setValue('');
      this.secQuestion.markAsTouched();
      this.secQuestionAns.markAsTouched();
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
