import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null;
  public isLoggedIn$: Subject<boolean> = new Subject();

  constructor(private http: HttpClient) {
    this.token = sessionStorage.getItem('token');
    if (this.token) {
      this.isLoggedIn$.next(true);
    }
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
            this.isLoggedIn$.next(true);
            return true;
          }
          return false;
        })
      );
  }

  public logout() {
    this.token = null;
    this.isLoggedIn$.next(false);
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
      password: password,
      token: token
    };
    if (token.length > 0) {
      console.log('token: ', token);
      return this.http.post('/user/passwordchange', req)
        .pipe(
          map((resp: any) => {
            if (resp.token) {
              resp.passwordChanged = true;
            } else {
              resp.passwordChanged = false;
            }
            console.log('adding authentication: ', resp);
            return resp;
          })
        );
    } else if (securityAnswer?.length > 0) {
      return this.http.post('/user/passwordresetquestion', req);
    } else {
      return this.http.post('/user/passwordreset', req);
    }
  }
}
