import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

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

  constructor() { }

  ngOnInit(): void {
  }

  login() {
    console.log(`${this.username.value}: ${this.password}`);
  }

  signup() {
    console.log(`${this.username}: ${this.password}\n${this.secQuestion}: ${this.secQuestionAns}`);
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
