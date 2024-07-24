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



@NgModule({
    declarations: [
        MainComponent,
        HomeComponent,
        LoginComponent,
        ProfileComponent,
        SlideshowComponent,
        AboutComponent,
        HeaderComponent
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
        MatButtonModule, MatCardModule, MatToolbarModule
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