import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null;

  constructor(private http: HttpClient) {
    this.token = sessionStorage.getItem('token');
  }

  public isAuthenticated(): boolean {
    if (this.token) {
      return true;
    }
    return false;
  }

  public login(username: string, password: string): Observable<any> {
    let req = {
      username: username,
      password: password
    };

    return this.http.post('/user/login', req)
      .pipe(
        map((resp: any) => {
          if (resp?.token) {
            this.token = resp.token;
            sessionStorage.setItem('token', resp.token);
            return true;
          }
          return false;
        })
      );
  }

  public changePassword(currPassword: string, newPassword: string): Observable<any> {
    return this.http.post('/user/passwordchange', 
    { newPassword: newPassword,
      currentPassword: currPassword,
      token: this.token 
    });
  }

  public logout() {
    this.token = null;
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }

  public signup(username: string, password: string, question: string, answer: string): Observable<any> {
    let req = {
      username: username,
      password: password,
      question: question,
      answer: answer
    };

    return this.http.post('/user/signup', req)
      .pipe(
        map((resp: any) => {
          if (resp?.token) {
            this.token = resp.token;
            sessionStorage.setItem('token', resp.token);
            return true;
          } else {
            throw resp;
          }
        })
      );
  }

  public passwordReset(username: string, securityAnswer: string, password: string, token: string) {
    let req = {
      username: username,
      answer: securityAnswer,
      newPassword: password,
      token: token,
      type: 'reset'
    };
    if (token.length > 0) {
      return this.http.post('/user/passwordchange', req)
        .pipe(
          map((resp: any) => {
            resp.passwordChanged = true;
            return resp;
          })
        );
    } else if (securityAnswer?.length > 0) {
      return this.http.post('/user/passwordresetquestion', req);
    } else {
      return this.http.post('/user/passwordreset', req);
    }
  }

  public updateSecurityQuestion(currPassword: string, securityQuestion: string, securityQuestionAns: string) {
    return this.http.post('/user/securityQuestionAnswerChange', 
      { question: securityQuestion, 
        answer: securityQuestionAns, 
        currentPassword: currPassword,
        token: this.token 
      });
  }

  public deleteUserAccount(): Observable<any> {
    return this.http.post('/main/deleteUser', {});
  }
}
