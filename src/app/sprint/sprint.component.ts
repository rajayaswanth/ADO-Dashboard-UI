import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { SprintService } from '../services/sprint.service';

@Component({
  selector: 'app-sprint',
  templateUrl: './sprint.component.html',
  styleUrl: './sprint.component.css'
})
export class SprintComponent  implements OnInit {

  sprintDetails:any=[];
  sprintData:any=[];
  iterations:any=[];
  teams:any=[];
  users = new Set();
  selectedTeam="360 Operations Artemis";
  selectedValue="";
  selectedSearch="Select User";
  selectedSprint="";
  searchWord="";
  userStoriesCount=0;
  commitPoints=0;
  completedPoints=0;
  inQAStories=0;
  inQAPoints=0;
  inDevelopmentStories=0;
  inDevelopmentPoints=0;
  blockedStories=0;
  blockedPoints=0;
  activePrs=0;
  draftPrs=0;
  completionPercentage=0;
  sprintCompletionPercentage=0;
  percentage=0;
  search = false;
  showImport = false;

  constructor(private sprintService: SprintService, private fb: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.search = false;
    this.getTeams();
    this.getIterations();
  }

  getTeams() {
    this.sprintService.getTeams().subscribe((data: any) => {
      this.teams = data;
    })
  }

  getIterations() {
    this.sprintService.getIterations(this.selectedTeam).subscribe((data: any) => {
      this.iterations = data;
      for(var iteration of this.iterations) {
        if(iteration.attributes.timeFrame == 'current') {
          this.selectedValue = iteration.id;
          this.selectedSprint = iteration.name;
        }
      }
      this.getSprintDetails();
    })
  }

  getSprintDetails() {
    this.search = false;
    this.users.clear();
    this.users.add("Select User");
    for(var iteration of this.iterations) {
      if(this.selectedValue === iteration.id && iteration.attributes.timeFrame == 'current') {
        this.showImport = true;
        break;
      } else {
        this.showImport = false;
      }
    }
    this.sprintService.getCurrentSprintDetails(this.selectedValue).subscribe((data: any) => {
      this.sprintData = data;
      this.sprintDetails = JSON.parse(JSON.stringify(data));
      this.getSprintOverViewDetails();
      this.getUsersList(this.sprintDetails);
    })
  }

  getSprintOverViewDetails() {
    this.userStoriesCount=0;
    this.commitPoints=0;
    this.completedPoints=0;
    this.inQAStories=0;
    this.inQAPoints=0;
    this.inDevelopmentStories=0;
    this.inDevelopmentPoints=0;
    this.blockedStories=0;
    this.blockedPoints=0;
    this.completionPercentage=0;
    this.sprintCompletionPercentage=0;
    this.percentage=0;
    this.activePrs=0;
    this.draftPrs=0;
    this.userStoriesCount = this.sprintData.sprintDetails.length;
    for(var details of this.sprintData.sprintDetails) {
      this.commitPoints += details.storyPoints;
      if(details.state == "QA Completed" || details.state == "Closed")
        this.completedPoints += details.storyPoints;
      if(details.state == "In QA") {
        this.inQAPoints += details.storyPoints;
        this.inQAStories += 1;
      }
      if(details.state == "In Development") {
        this.inDevelopmentPoints += details.storyPoints;
        this.inDevelopmentStories += 1;
      }
      if(details.state == "Blocked") {
        this.blockedPoints += details.storyPoints;
        this.blockedStories += 1;
      }
      if(details.prType === "Draft" && details.prStatus !== "completed") {
        this.draftPrs += 1;
      }
      if(details.prType === "Active" && details.prStatus !== "completed") {
        this.activePrs += 1;
      }
      this.completionPercentage += this.getCompletionPercentage(details.state, details.prCreatedDate);
    }
    if(this.userStoriesCount > 0) {
        this.percentage = Math.floor(this.completionPercentage/this.userStoriesCount);
        this.sprintCompletionPercentage = Math.floor((this.completedPoints/this.commitPoints)*100);
    }
  }

  getUsersList(sprintDetails : any) {
    for(var details of sprintDetails.sprintDetails) {
      this.users.add(details.assignedTo)
    }
  }

  getCompletionPercentage(storyStatus:any, prCreatedDate:any) {
		var completionPercent = 0;
		if(prCreatedDate != null)
			completionPercent = 25;
		if(storyStatus == "Development Completed")
			completionPercent = 50;
		if(storyStatus == "In QA")
			completionPercent = 75;
		if(storyStatus == "QA Completed" || storyStatus == "Closed")
			completionPercent = 100;
		return completionPercent;
	}

  calculateDiff(startDate: Date, completedDate: Date) {
    if(completedDate == null && startDate == null)
      return 0;
    if(completedDate == null)
      completedDate = new Date();
    var date1:any = new Date(startDate);
    var date2:any = new Date(completedDate);
    var diffDays:any = Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
    if(diffDays > 0)
      return diffDays;
    else
      return 0;
  }

  downloadSprintData() {
    this.sprintService.exportSprintData(this.selectedValue).subscribe((response: any) => {
      const fileName = 'Sprint_' + this.selectedSprint;
      var blob = new Blob([response], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      var objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, fileName);
    })
  }

  importSprintData() {
    this.sprintService.importSprintData(this.selectedValue).subscribe((response: any) => {
      alert("Data Import Successful")
    })
  }

  searchData() {
    this.search = !this.search;
  }

  searchText() {
    this.filterByAssignedTo(this.selectedSearch.trim())
  }

  filterByAssignedTo(searchString:any) {
    this.sprintData = JSON.parse(JSON.stringify(this.sprintDetails));
    if(searchString !== "Select User") {
      this.sprintData.sprintDetails = this.sprintData.sprintDetails.filter((sprint:any) => {
        if(sprint.assignedTo !== null && sprint.assignedTo.toLowerCase().includes(searchString.toLowerCase())){
          return sprint;
        }
      });
    }
    this.getSprintOverViewDetails();
  }

  filterByStatus(status:any) {
    this.sprintData = JSON.parse(JSON.stringify(this.sprintDetails));
    if(status !== "All") {
      this.sprintData.sprintDetails = this.sprintData.sprintDetails.filter((sprint:any) => {
        if(status === "Draft") {
          console.log(status)
          console.log(sprint.prType)
          if(sprint.prType !== null && sprint.prType.toLowerCase().includes(status.toLowerCase())){
            return sprint;
          }
        }
        else if(status === "active") {
          console.log(status)
          console.log(sprint.prType)
          if(sprint.prType !== null && sprint.prType.toLowerCase().includes(status.toLowerCase()) && sprint.prStatus !== "completed"){
            return sprint;
          }
        }
        else {
          if(sprint.state !== null && sprint.state.toLowerCase().includes(status.toLowerCase())){
            return sprint;
          }
        }
      });
    }
  }
}
