
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';

interface Post {
    image: string;
    description: string;
    likes: number;
    liked: boolean;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    posts: Post[] = [
        { image: 'assets/images/default-image.png', description: 'Sample post description', likes: 5, liked: false },
        // Add existing posts here or fetch them from a service
    ];

    newPost: Post = { image: '', description: '', likes: 0, liked: false };

    constructor(private router: Router, private authService: AuthService) { }

    onSubmit() {
        // Logic to handle new post submission
        this.posts.unshift({ ...this.newPost, likes: 0, liked: false }); // Add new post to the beginning of the array
        this.newPost = { image: '', description: '', likes: 0, liked: false }; // Reset newPost object
    }

    onFileSelected(event: any) {
        // Handle file upload for image
        const file: File = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.newPost.image = e.target.result; // Store base64 representation of the image
            };
            reader.readAsDataURL(file);
        }
    }

    toggleLike(post: Post) {
        if (post.liked) {
            post.likes--;
        } else {
            post.likes++;
        }
        post.liked = !post.liked;
    }

    sharePost(post: Post) {
        // Add logic to share the post (e.g., open a modal or share to external platform)
        console.log('Shared post:', post);
    }

    logout() {
        this.authService.logout();
    }

    toProfile() {
        this.router.navigate(['profile']);
    }

    toAbout() {
        this.router.navigate(['about']);
    }

    home() {
        this.router.navigate(['home-page']);
    }
}