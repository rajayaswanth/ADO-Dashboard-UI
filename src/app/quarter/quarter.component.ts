import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';

import { takeWhile, debounceTime, startWith } from 'rxjs/operators';
import Chart from 'chart.js/auto';
import { SprintService } from '../services/sprint.service';
import { SprintSummary } from '../models/SprintSummary';
import { UserDetails } from '../models/UserDetails';
import { UserSummary } from '../models/UserSummary';

@Component({
  selector: 'app-quarter',
  templateUrl: './quarter.component.html',
  styleUrl: './quarter.component.css'
})
export class QuarterComponent implements OnInit, OnDestroy {
  selectedTeam="360 Operations Artemis";
  teams:any=[];
  users = new Set();
  userData = new Map<string, number>();
  userDetails: UserSummary[] = [];
  alive: boolean = true;
  control: FormControl = new FormControl();
  year = 0;
  yearDefault = new Date().getFullYear();
  quarterDefault = 'Q' + (1 + Math.floor(new Date().getMonth() / 3));
  quarter= "Q1";
  showQuarter: boolean = true;
  year10 = 10;
  @ViewChild(NgControl, { static: false, read: ElementRef })
  controlID: any;

  canvas : any;
  ctx: any;
  datasets: any;
  myChartData: any;
  lables: any;
  chartData: any;
  commited: any;
  completed: any;
  spilled: any;
  totalCommited = 0;
  totalCompleted = 0;
  teamVelocity = 0.0;
  averageCompletionPercentage = 0.0;
  noOfSprints = 0;

  options: any[] = [
    { value: 'Q1', months: ['Jan', 'Feb', 'Mar'] },
    { value: 'Q2', months: ['Apr', 'May', 'Jun'] },
    { value: 'Q3', months: ['Jul', 'Aug', 'Sep'] },
    { value: 'Q4', months: ['Oct', 'Nov', 'Dec'] },
  ];

  getTeams() {
    this.sprintService.getTeams().subscribe((data: any) => {
      this.teams = data;
    })
  }

  constructor(private sprintService: SprintService) {
    this.control.valueChanges
      .pipe(
        takeWhile(() => this.alive),
        startWith(this.quarter + ' ' + this.year),
        debounceTime(200)
      )
      .subscribe((res: string) => {
        if (res) {
          res = res.toUpperCase();
          if (res[0] != 'Q') res = 'Q' + res;
          let value = res.replace(/[^Q|0-9]/g, '');
          let quarter = "Q1";
          let year;
          if (value.length >= 2) quarter = value[0] + value[1];
          if (value.length >= 6) {
            year = value.substr(2, 4);
            this.year = +year;
            this.quarter = quarter;
            this.control.setValue(this.quarter + ' ' + this.year, {
              emitEvent: false,
            });
          } else {
            this.year = 0;
            this.quarter = "";
          }
        }
      });
  }

  changeYear(year:any) {
    this.year = year || this.yearDefault;
    this.quarter = this.quarter || this.quarterDefault;
    this.control.setValue(this.quarter + ' ' + this.year || this.yearDefault, {
      emitEvent: false,
    });
  }

  changeShowQuarter() {
    this.showQuarter = !this.showQuarter;
    if (!this.showQuarter)
      this.year10 = this.year
        ? 10 * Math.floor(this.year / 10)
        : 10 * Math.floor(this.yearDefault / 10);
  }

  click(quarter:any, drop:any) {
    this.quarter = quarter;
    this.year = this.year || this.yearDefault;
    this.control.setValue(this.quarter + ' ' + this.year, { emitEvent: false });
    drop.close();
    if(this.quarter === 'Q1') {
      this.getQuarterData(this.year + "-01-01", this.year + "-03-31");
    } else if(this.quarter === 'Q2') {
      this.getQuarterData(this.year + "-04-01", this.year + "-06-30");
    } else if(this.quarter === 'Q3') {
      this.getQuarterData(this.year + "-07-01", this.year + "-09-30");
    } else if(this.quarter === 'Q4') {
      this.getQuarterData(this.year + "-10-01", this.year + "-12-31");
    }
  }
  

  ngOnDestroy() {
    this.alive = false;
  }

  getQuarterData(startDate:any, endDate:any) {
    this.sprintService.getQuarterData(this.selectedTeam, startDate, endDate).subscribe((data: SprintSummary[]) => {
      this.lables = [];
      this.commited = [];
      this.completed = [];
      this.spilled = [];
      this.userDetails = [];
      this.totalCommited = 0;
      this.totalCompleted = 0;
      this.teamVelocity = 0.0;
      this.averageCompletionPercentage = 0.0;
      this.noOfSprints = 0;
      this.users.clear();
      
      data.forEach( (element) => {
        this.lables.push(element.sprintName);
        this.totalCommited += element.sprintCommitPoints;
        this.commited.push(element.sprintCommitPoints);
        this.totalCompleted += element.completedPoints;
        this.completed.push(element.completedPoints);
        this.spilled.push(element.sprintCommitPoints - element.completedPoints);
        this.noOfSprints = this.noOfSprints + 1;
        for(var details of element.sprintDetails) {
          if(this.userDetails.some(summary => summary.userName === details.assignedTo)) {
            let indexToUpdate = this.userDetails.findIndex(summary => summary.userName === details.assignedTo);
            var user = new UserSummary();
            user.userName = this.userDetails[indexToUpdate].userName;
            if(details.state === "QA Completed" || details.state === "Closed")
              user.TotalPointsCompleted = details.storyPoints + this.userDetails[indexToUpdate].TotalPointsCompleted;
            else
              user.TotalPointsCompleted = this.userDetails[indexToUpdate].TotalPointsCompleted;
            user.velocity = user.TotalPointsCompleted/this.noOfSprints;
            this.userDetails[indexToUpdate] = user;
          } else {
            var user = new UserSummary();
            user.userName = details.assignedTo;
            if(details.state === "QA Completed" || details.state === "Closed")
              user.TotalPointsCompleted = details.storyPoints;
            else
              user.TotalPointsCompleted = 0;
            user.velocity = user.TotalPointsCompleted/this.noOfSprints;
            this.userDetails.push(user);
          }
        }
      });
      this.averageCompletionPercentage = (this.totalCompleted/this.totalCommited) * 100;
      this.teamVelocity = this.totalCompleted/this.noOfSprints;
      this.datasets = [
        this.commited,
        this.completed,
        this.spilled
      ];
      var chartExist = Chart.getChart("chartBig1");
      if (chartExist != undefined)  
        chartExist.destroy();
      this.chartData = {
        labels: this.lables,
        datasets: [{
              label: "Commited Points",
              borderColor: '#0e80f2',
              backgroundColor: '#0e80f2',
              data: this.datasets[0],
              maxBarThickness: 50
            },
            {
              label: "Completed Points",
              borderColor: '#7be506',
              backgroundColor: '#7be506',
              data: this.datasets[1],
              maxBarThickness: 50
            },
            {
              label: "Spilled Points",
              borderColor: '#ec250d',
              backgroundColor: '#ec250d',
              data: this.datasets[2],
              maxBarThickness: 50
            }
        ]
      };
      this.drawChart(this.chartData);
    })
  }

  drawChart(data:any) {
    this.canvas = document.getElementById("chartBig1");
    this.ctx = this.canvas.getContext("2d");

    this.myChartData = new Chart(this.ctx, {
      type: 'bar',
      data: data,
      options: {
        events: [],
        animation: {
          duration: 1,
          onComplete: function({ chart }) {
            const ctx = chart.ctx;

            chart.config.data.datasets.forEach(function(dataset, i) {
              const meta = chart.getDatasetMeta(i);

              meta.data.forEach(function(bar, index) {
                const value = dataset.data[index]?.toLocaleString();

                ctx.fillText(value!, bar.x - 5, bar.y - 10);
              });
            });
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            enabled: false
          }
        },
      },
    });
  }

  refreshData() {
    this.year = this.yearDefault;
    this.quarter = this.quarterDefault;
    this.control.setValue(this.quarter + ' ' + this.year || this.yearDefault, {
      emitEvent: false,
    });
    if(this.quarter === 'Q1') {
      this.getQuarterData(this.year + "-01-01", this.year + "-03-31");
    } else if(this.quarter === 'Q2') {
      this.getQuarterData(this.year + "-04-01", this.year + "-06-30");
    } else if(this.quarter === 'Q3') {
      this.getQuarterData(this.year + "-07-01", this.year + "-09-30");
    } else if(this.quarter === 'Q4') {
      this.getQuarterData(this.year + "-10-01", this.year + "-12-31");
    }
  }

  ngOnInit() {

    this.getTeams();
    this.refreshData()

    // var gradientChartOptionsConfigurationWithTooltipRed: any = {
    //   maintainAspectRatio: false,
    //   legend: {
    //     display: false
    //   },

    //   tooltips: {
    //     backgroundColor: '#f5f5f5',
    //     titleFontColor: '#333',
    //     bodyFontColor: '#666',
    //     bodySpacing: 4,
    //     xPadding: 12,
    //     mode: "nearest",
    //     intersect: 0,
    //     position: "nearest"
    //   },
    //   responsive: true,
    //   scales: {
    //     yAxes: [{
    //       barPercentage: 1.6,
    //       gridLines: {
    //         drawBorder: false,
    //         color: 'rgba(29,140,248,0.0)',
    //         zeroLineColor: "transparent"
    //       },
    //       ticks: {
    //         suggestedMin: 60,
    //         suggestedMax: 125,
    //         padding: 20,
    //         fontColor: "#9a9a9a"
    //       }
    //     }],

    //     xAxes: [{
    //       barPercentage: 1.6,
    //       gridLines: {
    //         drawBorder: false,
    //         color: 'rgba(233,32,16,0.1)',
    //         zeroLineColor: "transparent",
    //       },
    //       ticks: {
    //         padding: 20,
    //         fontColor: "#9a9a9a"
    //       }
    //     }]
    //   }
    // };

    // var gradientChartOptionsConfigurationWithTooltipGreen: any = {
    //   maintainAspectRatio: false,
    //   legend: {
    //     display: false
    //   },

    //   tooltips: {
    //     backgroundColor: '#f5f5f5',
    //     titleFontColor: '#333',
    //     bodyFontColor: '#666',
    //     bodySpacing: 4,
    //     xPadding: 12,
    //     mode: "nearest",
    //     intersect: 0,
    //     position: "nearest"
    //   },
    //   responsive: true,
    //   scales: {
    //     yAxes: [{
    //       barPercentage: 1.6,
    //       gridLines: {
    //         drawBorder: false,
    //         color: 'rgba(29,140,248,0.0)',
    //         zeroLineColor: "transparent",
    //       },
    //       ticks: {
    //         suggestedMin: 50,
    //         suggestedMax: 125,
    //         padding: 20,
    //         fontColor: "#9e9e9e"
    //       }
    //     }],

    //     xAxes: [{
    //       barPercentage: 1.6,
    //       gridLines: {
    //         drawBorder: false,
    //         color: 'rgba(0,242,195,0.1)',
    //         zeroLineColor: "transparent",
    //       },
    //       ticks: {
    //         padding: 20,
    //         fontColor: "#9e9e9e"
    //       }
    //     }]
    //   }
    // };

    // this.canvas = document.getElementById("chartLineRed");
    // this.ctx = this.canvas.getContext("2d");

    // var data = {
    //   labels: ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    //   datasets: [{
    //     label: "Data",
    //     fill: false,
    //     borderColor: '#ec250d',
    //     borderWidth: 2,
    //     borderDash: [],
    //     borderDashOffset: 0.0,
    //     pointBackgroundColor: '#ec250d',
    //     pointBorderColor: 'rgba(255,255,255,0)',
    //     pointHoverBackgroundColor: '#ec250d',
    //     pointBorderWidth: 20,
    //     pointHoverRadius: 4,
    //     pointHoverBorderWidth: 15,
    //     pointRadius: 4,
    //     data: [80, 100, 70, 80, 120, 80],
    //   }]
    // };

    // var myChart = new Chart(this.ctx, {
    //   type: 'line',
    //   data: data,
    //   options: gradientChartOptionsConfigurationWithTooltipRed
    // });


    // this.canvas = document.getElementById("chartLineGreen");
    // this.ctx = this.canvas.getContext("2d");


    // var gradientGreenStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    // gradientGreenStroke.addColorStop(1, 'rgba(66,134,121,0.15)');
    // gradientGreenStroke.addColorStop(0.4, 'rgba(66,134,121,0.0)'); //green colors
    // gradientGreenStroke.addColorStop(0, 'rgba(66,134,121,0)'); //green colors

    // var data = {
    //   labels: ['JUL', 'AUG', 'SEP', 'OCT', 'NOV'],
    //   datasets: [{
    //     label: "My First dataset",
    //     fill: false,
    //     borderColor: '#00d6b4',
    //     borderWidth: 2,
    //     borderDash: [],
    //     borderDashOffset: 0.0,
    //     pointBackgroundColor: '#00d6b4',
    //     pointBorderColor: 'rgba(255,255,255,0)',
    //     pointHoverBackgroundColor: '#00d6b4',
    //     pointBorderWidth: 20,
    //     pointHoverRadius: 4,
    //     pointHoverBorderWidth: 15,
    //     pointRadius: 4,
    //     data: [90, 27, 60, 12, 80],
    //   }]
    // };

    // var myChart = new Chart(this.ctx, {
    //   type: 'line',
    //   data: data,
    //   options: gradientChartOptionsConfigurationWithTooltipGreen

    // });



    // var gradientRedStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    // gradientRedStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    // gradientRedStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    // gradientRedStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors
    


    // this.canvas = document.getElementById("CountryChart");
    // this.ctx  = this.canvas.getContext("2d");
    // var gradientBlueStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    // gradientBlueStroke.addColorStop(1, 'rgba(29,140,248,0.2)');
    // gradientBlueStroke.addColorStop(0.4, 'rgba(29,140,248,0.0)');
    // gradientBlueStroke.addColorStop(0, 'rgba(29,140,248,0)'); //blue colors

  }

  // public updateOptions() {
  //   this.myChartData.data.datasets[0].data = this.data;
  //   this.myChartData.update();
  // }

}
