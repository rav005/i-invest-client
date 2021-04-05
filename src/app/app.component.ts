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
