import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { Account } from '../models/account';
import { Stock } from '../models/stock';

@Component({
  selector: 'app-view-account',
  templateUrl: './view-account.component.html',
  styleUrls: ['./view-account.component.scss']
})
export class ViewAccountComponent implements OnInit {

  account: Account | null = null;
  stocks: Stock[] = [];
  
  errorMsg: string | null = null;

  constructor(private _Activatedroute: ActivatedRoute, private router: Router, 
    private accountServ: AccountService) { }

  ngOnInit(): void {
    const id = this._Activatedroute.snapshot.paramMap.get('id');
    if (id) {
      this.accountServ.getAccount(id)
        .subscribe((resp: Account) => {
          this.account = resp;
        }, err => {
          if (err.message) {
            this.errorMsg = err.message;
          } else {
            this.errorMsg = 'Failed to load account';
          }
        });
    } else {
      this.router.navigate(['']);
    }
  }

}
