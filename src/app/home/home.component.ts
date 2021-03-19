import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from '../models/account';
import { Stock } from '../models/stock';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { StockService } from '../services/stocks.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  accounts: Account[];
  watchList: Stock[] = [];

  constructor(private auth: AuthService, private accountService: AccountService,
    private StockService: StockService, private router: Router) {
    this.accounts = [];
  }

  ngOnInit(): void {
    this.watchList = this.auth.getWatchList();
    this.getAccounts();
  }

  private getAccounts() {
    this.accountService.getAccounts()
      .subscribe(resp => {
        this.accounts = resp;
      }, err => {
        console.log('getAccounts() err: ', err);
        this.accounts = [];
      })
  }

  addAccount() {

  }

  viewAccount(account: Account) {
    this.router.navigate(['/account/' + account._id]);
  }

}
