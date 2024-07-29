import { Component, OnInit } from '@angular/core';
import { SprintService } from '../services/sprint.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {

  selectedTeam="360 Operations Artemis";
  teams:any=[];
  users:any=[];

  constructor(private sprintService: SprintService) {
  }

  ngOnInit() {
    this.getTeams();
    this.getUsers();
  }

  getTeams() {
    this.sprintService.getTeams().subscribe((data: any) => {
      this.teams = data;
    })
  }

  getUsers() {
    this.sprintService.getUsersByTeamName(this.selectedTeam).subscribe((data: any) => {
      this.users = data;
    })
  }

  updateUser(userId:any) {
    console.log(userId)
    this.sprintService.updateUserByUserId(userId).subscribe((data: any) => {
    });
  }

}
