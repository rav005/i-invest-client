import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { Account } from '../models/account';

@Injectable({
    providedIn: 'root'
  })
  export class AccountService {
    private accounts: Account[] = [];

    constructor(private http: HttpClient) {
      this.accounts = [];
    }

    public get() {
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

    public getAccount(id: string) {
        let req = { accountId: id };

        return this.http.post<Account>('/account/getAccount', req)
        .pipe(
            map((resp: any) => {
                if (resp.account) {
                    this.accounts.push(resp.account);
                    return resp.account;
                } else {
                    throw resp;
                }
            }
        ));
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

    public updateBalance(account: string, balance: number) {
        const req = { accountId: account, newBalance: balance };
        return this.http.post('/account/newBalance', req);
    }
}