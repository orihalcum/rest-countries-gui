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
    list: [],
    detail: {}
  };
  countries = {
    country: []
  };
  closeResult: string;
  
  constructor(private http: HttpClient, private modalService: NgbModal){
  }

  formNullCheck(e){
    let n = e.target.value.length;
    if(n == 0)
      this.country.list = this.country.source;  
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

    this.country.list = this.countries.country;  
    
  }

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
        this.country.list = this.country.source;
      });
    });
  }
}

