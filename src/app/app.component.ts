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
      },
      sort: {
        name: '',
        population: ''
      }
    },
    detail: {},
  };
  countries = {
    country: []
  };
  closeResult: string;
  isSearching = 0;
  searchForm = '';

  constructor(private http: HttpClient, private modalService: NgbModal){
      
  }

  // DATA

    // FORM SEARCH
      formSearchListener(e){

        this.isSearching = 1;

        this.countries = {
          country: []
        };
        
        this.country.list.sort = {
          name: '',
          population: ''
        };
        
        let n = e.target.value.length;

        if(n > 0){

          let keyword = e.target.value;
          
          let url_country_name = "https://restcountries.eu/rest/v2/name/" + keyword;
          this.http.get(url_country_name).subscribe(data => {            
              this.renderData(data);                  
          }, error => { this.renderData([]) });

          if(n > 1 && n <= 3){
            let url_iso_code = "https://restcountries.eu/rest/v2/alpha?codes=" + keyword;
            this.http.get(url_iso_code).subscribe(data => {
              this.renderData(data);                  
            }, error => { this.renderData([]) });
          }
        
        }else{

          // return to source list
          this.country.list = this.country.source;    
          
        }

      }

      renderData(data){
        
        if(data.length > 0){

          data.forEach(element => {
          
            if(element != undefined){
  
              let isExist = false;
              
              this.countries.country.forEach(el => {
                if(element.name == el.name)
                  isExist = true;
              });
              
              if(isExist == false)
                this.countries.country.push(element);                              
  
            }
  
          });
        
        }

        this.country.list.source =  this.countries.country.length > 0 ? this.sortByName(this.countries.country) : this.countries.country;
        this.country.list.data = this.country.list.source;
        this.setPagination();
        this.displayData();

      }
    // END OF FORM SEARCH
    
    resetTable(e){

      let n = 0;
      if(e.type != 'click')
        n = e.target.value.length;
      else
        this.searchForm = "";

      if(n == 0){
        this.country.list.source = this.sortByName(this.country.source);
        this.country.list.data = this.country.list.source;
        this.country.list.sort = {
          name: '',
          population: ''
        };
        this.setPagination();
        this.displayData();
      }

    }

  // END OF DATA
  
  // PAGINATION

    setPagination(){

      let n = this.country.list.source.length;
      let next_page;
      
      this.country.list.pagination.total = n;
      this.country.list.pagination.current_page = n > 0 ? 1 : 0;
      this.country.list.pagination.total_page = Math.ceil(n / this.country.list.pagination.limit);
      
      this.country.list.pagination.total_page > 1 ? next_page = 2 : next_page = this.country.list.pagination.total_page;
      this.country.list.pagination.next_page = next_page;
      this.country.list.pagination.prev_page = 0;

    }

    displayData(){
      
      let data = [];
      let from = ((this.country.list.pagination.current_page-1) * this.country.list.pagination.limit);
      let to = (this.country.list.pagination.current_page * this.country.list.pagination.limit) - 1;
      for(let i = from; i <= to; i++){
        if(this.country.list.source[i] != undefined)
          data.push(this.country.list.source[i]);
      }
      
      this.country.list.data = data;
      
      this.isSearching = 0;
      
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

  // END OF PAGINATION

  //
    sort(by,data,sort){

      switch (by) {
        case 'population':
          this.sortByPopulation(data, sort);
          break;
          
        default:
          break;
      }

      this.setPagination();
      this.displayData();

    }

    sortByName(data){
      
      return data.sort(function(a,b){ 
        var A = a.name.toUpperCase(); // ignore upper and lowercase
        var B = b.name.toUpperCase(); // ignore upper and lowercase
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }

        // names must be equal
        return 0;
      });

    }

    sortByPopulation(data, sort){

      this.country.list.sort.population = sort;
      return data.sort(function(a,b){ 
        switch (sort) {
          case "asc":
            return a.population - b.population;
            break;
          case "desc":
            return b.population - a.population;
            break;
          default: return data;
            break;
        }
      });

    }
  //

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

