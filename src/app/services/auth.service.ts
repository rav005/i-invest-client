import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  public login(username: string, password: string): Observable<any> {
    let req = {
      username: username,
      password: password
    };
    
    return this.http.post('/user/login', req)
    .pipe(
      map(resp => {
        console.log('data resp: ', resp);
        return resp;
      })
    );
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
      map(resp => {
        console.log('data resp: ', resp);
        return resp;
      })
    );
  }
}
