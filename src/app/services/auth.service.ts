import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
      this.watchList = JSON.parse(watchlist);
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
          this.watchList = resp.watchList;
          localStorage.setItem('token', resp.token);
          localStorage.setItem('watchlist', JSON.stringify(resp.watchList));
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
}
