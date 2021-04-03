import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Stock } from '../models/stock';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null;
  private watchList: Stock[] = [];

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('token');
    let watchlist = localStorage.getItem('watchlist');
    if (watchlist) {
      try {
        this.watchList = JSON.parse(watchlist);
      } catch(err) {}
    }
  }

  public isAuthenticated(): boolean {
    if (this.token) {
      return true;
    }
    return false;
  }

  public getWatchList(): Stock[] {
    return this.watchList;
  }

  private loadWatchlist() {
    this.http.get('/stock/getWatchlist')
      .subscribe((resp: any) => {
        if (resp?.watchList) {
          this.watchList = resp.watchList;
          localStorage.setItem('watchlist', JSON.stringify(resp.watchList));
        }
      }, err => {});
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
            localStorage.setItem('token', resp.token);
            //sessionStorage.setItem('keys', JSON.stringify(resp.keys));
            this.loadWatchlist();
            return true;
          }
          return false;
        })
      );
  }

  public logout() {
    this.token = null;
    this.watchList = [];
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
            localStorage.setItem('token', resp.token);
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
