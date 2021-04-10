import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { Account, Portfolio } from '../models/account';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PurchaseStock } from '../models/stock';

declare var jQuery: any;

@Component({
  selector: 'app-view-account',
  templateUrl: './view-account.component.html',
  styleUrls: ['./view-account.component.scss']
})
export class ViewAccountComponent implements OnInit {

  portfolio: Portfolio | null = null;
  activeStock: PurchaseStock | null = null;

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
        .subscribe((resp: Portfolio) => {
          this.portfolio = resp;
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
    this.accountServ.deleteAccount(this.portfolio!.account!._id)
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
      let amount = this.portfolio!.account!.balance;
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

      this.accountServ.updateBalance(this.portfolio!.account!._id, amount, this.fundsUpdateType!, this.portfolio!.account!.balance)
        .subscribe(resp => {
          this.portfolio!.account!.balance = amount;
          jQuery("#updateFunds").modal("hide");
        }, err => {
          this.modelErrorMsg = `Failed to ${this.fundsUpdateType}`;
        });
    }
  }

  cancel(stock: PurchaseStock, action: string) {
    this.activeStock = stock;
    
    if (action === 'show') {
      jQuery("#cancelPurchase").modal("show");
    }

    if (action === 'cancel') {
        
    }
  }

  sell() {

  }

}
