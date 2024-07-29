import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { BodyComponent } from './body/body.component';
import { SprintComponent } from './sprint/sprint.component';
import { QuarterComponent } from './quarter/quarter.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { UserComponent } from './user/user.component';
import { NgToggleModule } from '@nth-cloud/ng-toggle';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BodyComponent,
    SprintComponent,
    QuarterComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    CanvasJSAngularChartsModule,
    NgToggleModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
