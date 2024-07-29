import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { SprintSummary } from '../models/SprintSummary';

@Injectable({
  providedIn: 'root'
})
export class SprintService {

  constructor(private httpClient: HttpClient) { }

  headers = new HttpHeaders();
  url = "http://localhost:9090/";

  public getCurrentSprintDetails(iterationId: String){
    this.headers.set("content-type","application/json");
    return this.httpClient.get(this.url + "getCurrentWorkitems/" + iterationId, { 'headers': this.headers });
  }

  public getIterations(teamName: String){
    this.headers.set("content-type","application/json");
    return this.httpClient.get(this.url + "getIterations/" + teamName, { 'headers': this.headers });
  }

  public getUsersByTeamName(teamName: String){
    this.headers.set("content-type","application/json");
    return this.httpClient.get(this.url + "getUsersByTeamName/" + teamName, { 'headers': this.headers });
  }

  public updateUserByUserId(userId: any){
    return this.httpClient.patch(this.url + "updateUser/" + userId, {});
  }

  public getTeams(){
    this.headers.set("content-type","application/json");
    return this.httpClient.get(this.url + "getAllTeams", { 'headers': this.headers });
  }

  public exportSprintData(iterationId: String){
    this.headers.set("content-type","application/octet-stream");
    return this.httpClient.get(this.url + "sprint/export/excel/" + iterationId, { responseType: 'blob' });
  }

  public importSprintData(iterationId: String){
    this.headers.set("content-type","application/json");
    return this.httpClient.get(this.url + "importCurrentWorkItems/" + iterationId, { 'headers': this.headers });
  }

  getQuarterData(teamName: String, startDate: String, endDate: String): Observable<SprintSummary[]> {
    this.headers.set("content-type","application/json");
    return this.httpClient.get<SprintSummary[]>(this.url + "getCurrentWorkitems/" + teamName + "/start/" + startDate + "/end/" + endDate, { 'headers': this.headers })
    .pipe(
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    errorMessage = `An error has occurred: ${err.error.message}`;
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }
  
}
