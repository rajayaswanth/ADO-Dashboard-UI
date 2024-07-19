import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dash-body',
  templateUrl: './body.component.html',
  styleUrl: './body.component.css'
})
export class BodyComponent implements OnInit {

  page="quarterly";

  constructor() { }

  ngOnInit(): void {
  }

  changePage(gotoPage: string) {
    this.page = gotoPage;
  }
  
}
