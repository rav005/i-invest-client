import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SearchStock } from './models/stock';
import { AuthService } from './services/auth.service';
import { StockService } from './services/stocks.service';

declare var jQuery: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'I-Invest-Client';
  
  searchText: string = '';
  searchResult: SearchStock[] = [];

  currentPassword: string = ''; 
  newPassword: string = '';
  confirmPassword: string = '';
  modelErrorMsg: string = '';

  secQuestion: string = '';
  secQuestionAns: string = '';

  @ViewChild('searchInputEle')
  searchInputEle!: ElementRef;
  
  @ViewChild('searchResultEle')
  searchResultEle!: ElementRef;
  
  constructor(private auth: AuthService, private stockService: StockService, 
    private router: Router) { }

  logout() {
    this.auth.logout();
  }

  search() {
    if (this.searchText.length > 2) {
      this.searchResult = this.stockService.search(this.searchText);
    }
  }

  view(symbol: string, name: string) {
    this.router.navigate(['stock', symbol, name]).then(r => {
      if (this.router.url.includes('/stock/')) {
        window.location.reload();
      }
    });
  }

  reset() {
    this.modelErrorMsg = this.currentPassword = '';
    this.newPassword = this.confirmPassword = '';
    this.secQuestion = this.secQuestionAns = '';
  }

  changePassword() {
    if (!this.currentPassword || this.currentPassword.trim().length == 0) {
      this.modelErrorMsg = 'Current password required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.modelErrorMsg = 'Passwords does not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.modelErrorMsg = 'Passwords must be 6 characters long';
      return;
    }

    this.auth.changePassword(this.currentPassword, this.newPassword).toPromise()
    .then(resp => { 
      jQuery("#changePassword").modal("hide");
      this.reset();
    }).catch(err => {
      if (err.error.message?.includes("incorrect password")) {
        this.modelErrorMsg = 'Incorrect current password';
      } else {
        this.modelErrorMsg = 'Failed to change password';
      }
      this.newPassword = this.confirmPassword = this.currentPassword  = '';
    });
  }

  updateSecurityQuestion() {
    if (!this.currentPassword || this.currentPassword.trim().length == 0) {
      this.modelErrorMsg = 'Current password required';
      return;
    }

    if (!this.secQuestion || this.secQuestion.trim().length == 0) {
      this.modelErrorMsg = 'Security question required';
      return;
    }

    if (!this.secQuestionAns || this.secQuestionAns.trim().length == 0) {
      this.modelErrorMsg = 'Security question answer required';
      return;
    }

    this.auth.updateSecurityQuestion(this.currentPassword, this.secQuestion, this.secQuestionAns).toPromise()
    .then(resp => { 
      jQuery("#updateSecQues").modal("hide");
      this.reset();
    }).catch(err => {
      if (err.error.message?.includes("incorrect password")) {
        this.modelErrorMsg = 'Incorrect current password';
      } else {
        this.modelErrorMsg = 'Failed to update security question';
      }
      this.secQuestion = this.secQuestionAns = this.currentPassword = '';
    });
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    if (jQuery(event.target).hasClass('stock')) {
      jQuery(event.target).click();
      this.searchResult = [];
    } else {
      if (this.searchInputEle?.nativeElement && this.searchResultEle?.nativeElement) {
        if(event.target !== this.searchInputEle.nativeElement && event.target !== this.searchResultEle.nativeElement) {
          this.searchResult = [];
        } else {
          this.search();
        }
      }
    }
  }
}
