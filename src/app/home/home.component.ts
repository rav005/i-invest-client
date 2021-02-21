import { Component, OnInit } from '@angular/core';
import { Account } from '../models/account';
import { Stock } from '../models/stock';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  accounts: Account[];
  stocks: Stock[];

  constructor() {
    this.accounts = [];
    this.stocks = [];
  }

  ngOnInit(): void {
  }

}
