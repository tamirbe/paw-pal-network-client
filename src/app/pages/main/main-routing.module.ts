import { NgModule } from '@angular/core';
import { RouterModule, Routes ,Router, Event, NavigationEnd} from '@angular/router';//add Router, Event, NavigationEnd
import { MainComponent } from './main.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../../app.guard';
import { AboutComponent } from './about/about.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common'; //addd
import { SearchResultsComponent } from './search-results/search-results.component'; // add
import { UserProfileComponent } from './user-profile/user-profile.component'; // יבוא הקומפוננטה החדשה

const routes: Routes = [
    {
        path: "",
        component: MainComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'home-page', component: HomeComponent, canActivate: [AuthGuard] },
            { path: 'another/:username', component: UserProfileComponent, canActivate: [AuthGuard] }, // הוספת הנתיב לפרופיל המשתמש
            { path: 'profile/:username', component: ProfileComponent, canActivate: [AuthGuard] },
            { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
            { path: 'search', component: SearchResultsComponent, canActivate: [AuthGuard] }, // add
            { path: '**', redirectTo: '/login' },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy } //add
    ],
})
/*export class AppRoutingModule { //add export class AppRoutingModule
    constructor(private router: Router) {
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          window.scrollTo(0, 0);
        }
      });
    }
  }

  */
export class MainRoutingModule { }