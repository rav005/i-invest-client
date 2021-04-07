import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Account } from '../models/account';
import { News, Stock } from '../models/stock';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { StockService } from '../services/stocks.service';

declare var jQuery: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  accounts: Account[];
  watchList: Stock[] = [];
  marketNews: News[] = [];
  filterMarketNews: News[] = [];
  hasMoreNews: boolean = false;

  accountForm: FormGroup;
  errorMsg: string = '';

  constructor(private accountService: AccountService,
    private stockService: StockService, private router: Router) {
    this.accounts = [];

    this.accountForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      balance: new FormControl('', [Validators.required, Validators.min(1)]),
      currency: new FormControl('CAD', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.stockService.getWatchList(true).toPromise()
    .then(x => this.watchList = x)
    .catch(x => this.watchList = x);
    this.getAccounts();
    this.stockService.init();
    this.getMarketNews();
  }

  private getAccounts() {
    this.accountService.getAccounts()
      .subscribe(resp => {
        this.accounts = resp;
      }, err => {
        this.accounts = [];
      })
  }

  private getMarketNews() {
    this.stockService.getMarketNews()
      .subscribe(
        (resp: News[]) => {
          this.marketNews =  resp;
          if (this.marketNews.length > 0) {
            this.filterMarketNews = this.marketNews.slice(0, 5);
            if (this.marketNews.length > 5) {
              this.hasMoreNews = true;
            }
          }
        }, err => {
        }
      );
  }
  
  getMoreNews() {
    let fl = this.filterMarketNews.length;
    let max = this.marketNews.length;
    this.filterMarketNews = this.marketNews.slice(0, fl + 5);
    if (fl + 5 >= max){
      this.hasMoreNews = false;
    }
  }

  get getControl() {
    return this.accountForm.controls;
  }

  addAccount() {
    this.accountForm.markAllAsTouched();
    if (this.accountForm.valid) {
      let val = this.accountForm.value;
      console.log('values: ', val);

      this.accountService.addAccount(val.name, val.balance, val.currency)
        .subscribe(resp => {
          this.accounts.push(resp);
          jQuery("#addAccount").modal("hide");
        }, err => {
          console.log('error: ', err);
          this.errorMsg = 'Failed to create account';
        });
      
    }
  }

  removeWatchlist(symbol: string) {
    this.stockService.toggleWatchlist(symbol, '', '', false).toPromise()
    .then(x => {
      this.watchList = this.watchList.filter(w => w.symbol != symbol);
    }).catch(e => {});
  }

  viewAccount(account: Account) {
    this.router.navigate(['/account/' + account._id]);
  }

  view(stock: Stock) {
    this.router.navigate(['/stock', stock.symbol, stock.name, stock.currency]);
  }

}
