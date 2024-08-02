import { Component, Input } from '@angular/core';
import { Post } from './home.component';

@Component({
  selector: 'app-shared-post',
  templateUrl: './shared-post.component.html',
  styleUrls: ['./home.component.scss']

})
export class SharedPostComponent {
  @Input() post!: Post;

  constructor() { }

  getTextDirection(text: string): string {
    return /[\u0590-\u05FF]/.test(text) ? 'rtl' : 'ltr';
  }

  sanitizeImageUrl(url: string): string {
    // Implement the sanitization logic if needed
    return url;
  }
}
