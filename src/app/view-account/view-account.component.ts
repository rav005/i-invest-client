import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { Account } from '../models/account';
import { Stock } from '../models/stock';
import { FormControl, FormGroup, Validators } from '@angular/forms';

declare var jQuery: any;

@Component({
  selector: 'app-view-account',
  templateUrl: './view-account.component.html',
  styleUrls: ['./view-account.component.scss']
})
export class ViewAccountComponent implements OnInit {

  account: Account | null = null;
  stocks: Stock[] = [];
  
  errorMsg: string | null = null;
  modelErrorMsg: string | null = null;

  fundsUpdateType: string = '';

  updateFundsForm: FormGroup;

  constructor(private activatedroute: ActivatedRoute, private router: Router, 
    private accountServ: AccountService) { 

      this.updateFundsForm = new FormGroup({
        balance: new FormControl('', [Validators.required, Validators.min(1)])
      });
    }

  ngOnInit(): void {
    const id = this.activatedroute.snapshot.paramMap.get('id');
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

  deleteAccount() {
    this.accountServ.deleteAccount(this.account!._id)
    .subscribe((resp: Boolean) => {
      if (resp) {
        jQuery("#deleteAccount").modal("hide");
        this.router.navigate(['']);
      } else {
        this.modelErrorMsg = 'Failed to delete account';  
      }
    }, err => {
      this.modelErrorMsg = 'Failed to delete account';
      console.log('err: ', err);
    });
  }

  updateFundsType(type: string) {
    this.fundsUpdateType = type;
    this.updateFundsForm.reset();
    this.modelErrorMsg = '';
  }

  get getFundsControl() {
    return this.updateFundsForm.controls;
  }

  updateFunds() {
    this.updateFundsForm.markAllAsTouched();
    if (this.updateFundsForm.valid) {
      let amount = this.account!.balance;
      if (isNaN(this.updateFundsForm.value.balance)) {
        this.modelErrorMsg = 'Invalid amount';
        return;
      }
      if (this.fundsUpdateType === 'Deposit') {
        amount += this.updateFundsForm.value.balance;
      } else {
        amount -= this.updateFundsForm.value.balance;
        if (amount < 0) {
          this.modelErrorMsg = 'Insufficient balance';
          return;
        }
      }

      this.accountServ.updateBalance(this.account!._id, amount)
        .subscribe(resp => {
          this.account!.balance = amount;
          jQuery("#updateFunds").modal("hide");
        }, err => {
          this.modelErrorMsg = `Failed to ${this.fundsUpdateType}`;
        });
    }
  }

}
