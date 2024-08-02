import { NgModule } from '@angular/core';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from "@angular/common"
import { NgIf } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthService } from '../../auth.service';
import { AuthGuard } from '../../app.guard';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideHttpClient } from '@angular/common/http';
import { SlideshowComponent } from '../../components/slideshow/slideshow.component';
import { AboutComponent } from './about/about.component';
import { HeaderComponent } from '../../components/header/header.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common'; //addd
import { UserService } from './profile/userService';
import { RouterModule } from '@angular/router'; // add
import { SearchResultsComponent } from './search-results/search-results.component'; // add
import { MatIconModule } from '@angular/material/icon';
import { UserProfileComponent } from './user-profile/user-profile.component'; // עדכן את הנתיב בהתאם למיקום של UserProfileComponent
import { RegularPostComponent } from '../../pages/main/home/regular-post.component'; // add
import { SharedPostComponent } from '../../pages/main/home/shared-post.component'; //add



@NgModule({
    declarations: [
        MainComponent,
        HomeComponent,
        LoginComponent,
        ProfileComponent,
        SlideshowComponent,
        AboutComponent,
        HeaderComponent,
        SearchResultsComponent, // add
        UserProfileComponent, // add
        RegularPostComponent,
        SharedPostComponent,    
    ],
    imports: [
        MainRoutingModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        NgIf,
        MatCheckboxModule,
        CommonModule,
        MatButtonModule, MatCardModule, MatToolbarModule,
        RouterModule, // add
        MatIconModule
    ],
    providers: [
        UserService,
        AuthService,
        AuthGuard,
        provideHttpClient(),
        { provide: LocationStrategy, useClass: HashLocationStrategy } // add
    ],
})
export class MainModule {
}