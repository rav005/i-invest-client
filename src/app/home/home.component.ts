import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Account } from '../models/account';
import { Stock } from '../models/stock';
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

  accountForm: FormGroup;
  errorMsg: string = '';

  constructor(private auth: AuthService, private accountService: AccountService,
    private StockService: StockService, private router: Router) {
    this.accounts = [];

    this.accountForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      balance: new FormControl('', [Validators.required, Validators.min(1)]),
      currency: new FormControl('CAD', [Validators.required])
    });
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
      
    } else {

    }
  }

  viewAccount(account: Account) {
    this.router.navigate(['/account/' + account._id]);
  }

}
