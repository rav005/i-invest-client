import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Account, Portfolio } from '../models/account';

@Injectable({
    providedIn: 'root'
  })
  export class AccountService {
    private accounts: Account[] = [];

    constructor(private http: HttpClient) {
      this.accounts = [];
    }

    public get() : Account[] {
        return this.accounts;
    }

    public getAccounts() {
        return this.http.get<Account[]>('/account/getAllAccounts')
        .pipe(
            map((resp: any) => {
                this.accounts = resp.accounts;
                return resp.accounts;
            }
        ));
    }

    public getAccount(id: string): Observable<Portfolio> {
        let req = { accountId: id };

        return this.http.post<Portfolio>('/account/getAccount', req);
    }

    public addAccount(name: string, balance: number, currency: string) {
        let req = { name: name, balance: balance, currency: currency };

        return this.http.post<Account>('/account/addAccount', req)
        .pipe(
            map((resp: any) => {
                if (resp.account) {
                    return resp.account;
                } else {
                    throw resp;
                }
            })
        );
    }

    public deleteAccount(id: string) {
        const req = { accountId: id };

        return this.http.post<boolean>('/account/deleteAccount', req)
        .pipe(
            map((resp: any) => {
                return true;
            })
        );
    }

    public updateBalance(account: string, balance: number, type: string, prevBalance: number) {
        const req = { accountId: account, newBalance: balance, transactionType: type, prevBalance: prevBalance };
        return this.http.post('/account/newBalance', req);
    }
}