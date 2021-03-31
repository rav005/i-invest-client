import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  
  constructor(private auth: AuthService, private stockService: StockService) { 
  }

  logout() {
    this.auth.logout();
  }

  search() {
    if (this.searchText.length > 2) {
      this.searchResult = this.stockService.search(this.searchText);
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    if(event.target !== this.searchInputEle.nativeElement && event.target !== this.searchResultEle.nativeElement) {
      this.searchResult = [];
    } else {
      this.search();
    }
  }
}
