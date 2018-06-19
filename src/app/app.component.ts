import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  title = 'app';
  country = {
    source: [],
    list: {
      source: [],
      data: [],
      pagination: {
        limit: 10,
        total: 0,
        total_page: 0,
        current_page: 0,
        next_page: 0,
        prev_page: 0
      }
    },
    detail: {},
  };
  countries = {
    country: []
  };
  closeResult: string;
  
  constructor(private http: HttpClient, private modalService: NgbModal){
  }

  // DATA
    formNullCheck(e){
      let n = e.target.value.length;
      if(n == 0){
        this.country.list.data = this.country.source;
        this.country.list.source = this.country.source;
        this.setPagination();
        this.displayData();
      }
    }

    formSearchListener(e){

      this.countries = {
        country: []
      };
      
      let n = e.target.value.length;

      if(n > 0){

        let keyword = e.target.value;
        
        let url_country_name = "https://restcountries.eu/rest/v2/name/" + keyword;
        this.http.get(url_country_name)
        .subscribe(data => {
            this.renderData(data);                  
          });

        if(n > 1 && n <= 3){
          let url_iso_code = "https://restcountries.eu/rest/v2/alpha?codes=" + keyword;
          this.http.get(url_iso_code).subscribe(data => {
            this.renderData(data);                  
          });
        }
      
      }else{

        // return to source list
        this.country.list = this.country.source;    
        
      }

    }

    renderData(data){
      
      data.forEach(element => {
      
        let isExist = false;
        
        this.countries.country.forEach(el => {
          if(element.name == el.name)
            isExist = true;
        });
        
        if(isExist == false){
          this.countries.country.push(element);                              
          this.countries.country.sort(this.dynamicSort(element.name));
        }

      });

      this.country.list.data = this.countries.country;
      this.country.list.source = this.countries.country;
      this.setPagination();
      this.displayData();
      
    }

  // END OF DATA
  
  // PAGINATION

    setPagination(){

      let n = this.country.list.source.length;
      let next_page, prev_page = 0;
      
      this.country.list.pagination.total = n;
      this.country.list.pagination.current_page = 1;
      this.country.list.pagination.total_page = Math.ceil(n / this.country.list.pagination.limit);
      
      if(this.country.list.pagination.total_page > 1)
        next_page = 2;
      
      this.country.list.pagination.next_page = next_page;
      this.country.list.pagination.prev_page = prev_page;

    }

    goTo(n){
    
      let go = n;
      if(n == 1){
        this.setPagination();
      }else if(n > 1 && n < this.country.list.pagination.total_page){
        this.country.list.pagination.current_page = n;
        this.country.list.pagination.next_page = n + 1;
        this.country.list.pagination.prev_page = n - 1;
      }else if(n == this.country.list.pagination.total_page){
        this.country.list.pagination.current_page = n;
        this.country.list.pagination.prev_page = n - 1; 
        this.country.list.pagination.next_page = n;               
      }
      
      this.displayData();
      
    }

    displayData(){

      let data = [];
      let from = ((this.country.list.pagination.current_page-1) * this.country.list.pagination.limit);
      let to = (this.country.list.pagination.current_page * this.country.list.pagination.limit) - 1;
      for(let i = from; i <= to; i++)
        data.push(this.country.list.source[i]);

      this.country.list.data = data;

    }

  // END OF PAGINATION

  // MODAL
    open(country, content) {
      this.country.detail = country;
      this.modalService.open(content).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }

    private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
      } else {
        return  `with: ${reason}`;
      }
    }
  // END OF MODAL

  // HELPER
    dynamicSort(property) {
      var sortOrder = 1;
      if(property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
      }
      return function (a,b) {
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
      }
    }
    removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }
  // END OF HELPER

  ngOnInit(): void {
    this.http.get('https://restcountries.eu/rest/v2/all').subscribe(data => {
      data.forEach(element => {
        this.country.source.push(element);
        this.country.list.data = this.country.source;
        this.country.list.source = this.country.source;
        this.setPagination();
        this.displayData();
      });
    });
  }
}

