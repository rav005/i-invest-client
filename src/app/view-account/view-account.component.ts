import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { Account, Exchange, Portfolio, Transaction } from '../models/account';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PurchaseStock } from '../models/stock';
import { StockService } from '../services/stocks.service';

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

  toggleActivitySection: boolean = false;
  showActivityBtn: boolean = true;
  transactions: Transaction[] = [];

  sellForm: FormGroup;
  private exchange: Exchange | null = null;
  exchangeRate: number = 1;
  accountCurrency: string = '';
  exchangeCurrency: string = '';

  constructor(private activatedroute: ActivatedRoute, private router: Router, 
    private accountServ: AccountService, private stockService: StockService) { 

      this.updateFundsForm = new FormGroup({
        balance: new FormControl('', [Validators.required, Validators.min(1)])
      });

      this.sellForm = new FormGroup({
        type: new FormControl('', [Validators.required]),
        quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
        price: new FormControl(0, [Validators.required, Validators.min(0)])
      });
    }

  ngOnInit(): void {
    const id = this.activatedroute.snapshot.paramMap.get('id');
    if (id) {
      this.loadAccount(id);
    } else {
      this.router.navigate(['']);
    }
  }

  private loadAccount(accountId: string) {
    this.accountServ.getAccount(accountId)
    .subscribe((resp: Portfolio) => {
      this.portfolio = resp;

      if(this.exchange == null) {
        this.getCurrencyRates();
      }
      this.getActivity(accountId);
    }, err => {
      if (err?.error?.message) {
        this.errorMsg = err.error.message;
      } else {
        this.errorMsg = 'Failed to load account';
      }
    });
  }

  private getActivity(accountId: string) {
    this.accountServ.getActivity(accountId)
    .subscribe(
      resp => {
        this.transactions = resp;
      }, err => { 
        this.showActivityBtn = false;
      }
    )
  }

  private getCurrencyRates() {
    this.stockService.getCurrenyRates()
    .subscribe(
      resp => {
        if (resp) {
          this.exchange = resp;
        }
      }, err => {}
    );
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
          this.loadAccount(this.portfolio!.account!._id);
          jQuery("#updateFunds").modal("hide");
        }, err => {
          this.modelErrorMsg = `Failed to ${this.fundsUpdateType}`;
        });
    }
  }

  toggleActivity() {
    this.toggleActivitySection = !this.toggleActivitySection;
  }

  cancel(stock: PurchaseStock, action: string) {
    this.activeStock = stock;
    
    if (action === 'show') {
      jQuery("#cancelPurchase").modal("show");
      return;
    }

    if (action === 'cancel') {
      this.stockService.cancelOrder(stock.accountId, stock.id)
      .subscribe(
        resp => {
          if (resp) {
            this.loadAccount(stock.accountId);
            jQuery("#cancelPurchase").modal("hide");
          } else {
            this.errorMsg = 'Failed to cancel order';
          }
        }, err => {
          if (err?.error?.message) {
            this.errorMsg = err.error.message;
          } else {
            this.errorMsg = 'Failed to cancel order';
          }
        });
    }
  }

  sell(stock: PurchaseStock) {
    this.activeStock = stock;

    this.sellForm = new FormGroup({
      type: new FormControl('', [Validators.required]),
      quantity: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(stock.quantity)]),
      price: new FormControl(0, [Validators.required, Validators.min(0)]),
      total: new FormControl(0)
    });

    this.accountCurrency = this.portfolio!.account.currency;
    this.exchangeCurrency = stock.currency;
    let price = stock.currentPrice;
    if (this.exchange) { 
      if (this.exchangeCurrency == 'USD' && this.accountCurrency != 'USD') {
        this.exchangeRate = this.exchange!.USD_CAD;
        price = stock.currentPrice * this.exchangeRate;
        this.exchangeCurrency = 'USD';
      } else if (this.exchangeCurrency == 'CAD' &&this.accountCurrency != 'CAD') {
        this.exchangeRate = this.exchange!.CAD_USD;
        price = stock.currentPrice * this.exchangeRate;
        this.exchangeCurrency = 'CAD';
      }

      price = Number.parseFloat(price.toFixed(2));
    }

    this.sellForm.patchValue({
      type: 'Market sell',
      price: price,
      total: price
    });

    jQuery("#sellStock").modal("show");

  }

  updateForm() {
    const quantity = this.sellForm.value.quantity;
    let price = this.activeStock!.currentPrice * this.exchangeRate * quantity;
    this.sellForm.patchValue({
      total: price
    });

    if (quantity > this.activeStock!.quantity) {
      this.modelErrorMsg = 'Insufficient quantity';
    } else {
      this.modelErrorMsg = '';
    }
  }

  submitSell() {
    let price = this.sellForm.value.price;
    let quantity = this.sellForm.value.quantity;
    let type = this.sellForm.value.type;
    let accId = this.activeStock!.accountId;
    let stockId = this.activeStock!.id;

    this.stockService.sellStock(accId, stockId, quantity, price, type)
    .subscribe(
      (resp) => {
        if (resp) {
          this.loadAccount(accId);
          jQuery("#sellStock").modal("hide");
        } else {
          this.modelErrorMsg = 'Failed to sell stock';
        }
      }, err => {
        this.modelErrorMsg = 'Failed to sell stock';
      }
    )
  }

}
