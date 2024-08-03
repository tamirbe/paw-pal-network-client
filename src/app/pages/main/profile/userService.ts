import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL

    constructor(private http: HttpClient) { }

    getUserProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/profile`);
    }

    updateUserProfile(user: User): Observable<any> {
        return this.http.put(`${this.apiUrl}/profile`, user);
    }

    getUserFollowing(): Observable<string[]> {
        return this.http.get<string[]>('/api/user/following');
    }

    getUploadedContent(): Observable<any[]> {
        return this.http.get<any[]>('/api/user/uploaded-content');
    }

    getFavoriteContent(): Observable<any[]> {
        return this.http.get<any[]>('/api/user/favorite-content');
    }

    getSavedContent(): Observable<any[]> {
        return this.http.get<any[]>('/api/user/saved-content');
    }

    changeUserPassword(currentPassword: string, newPassword: string): Observable<any> {
        const body = { currentPassword, newPassword };
        return this.http.post(`${this.apiUrl}/change-password`, body);
    }

    unfollowUser(username: string): Observable<void> {
        return this.http.post<void>(`/api/user/unfollow/${username}`, {});
    }

    removeUploadedContent(contentId: string): Observable<void> {
        return this.http.delete<void>(`/api/user/uploaded-content/${contentId}`);
    }

    deleteAccount(): Observable<void> {
        return this.http.delete<void>('/api/user/delete');
    }
}