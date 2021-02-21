import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
  })
  export class AccountService {
    private accounts: Account[] = [];

    constructor(private http: HttpClient) {
      this.accounts = [];
    }

    public getAccounts() {
        return this.http.get('/account/getAllAccounts')
        .pipe(
            map((resp: any) => {
                this.accounts = resp.accounts;
                return resp.accounts;
            }
        ));
    }
}