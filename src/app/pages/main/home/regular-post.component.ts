import { Component, Input } from '@angular/core';
import { Post } from './home.component';

@Component({
  selector: 'app-regular-post',
  templateUrl: './regular-post.component.html',
  styleUrls: ['./home.component.scss']

})
export class RegularPostComponent {
  @Input() post!: Post;
  @Input() currentUser!: string;

  constructor() { }

  getTextDirection(text: string): string {
    return /[\u0590-\u05FF]/.test(text) ? 'rtl' : 'ltr';
  }

  sanitizeImageUrl(url: string): string {
    return url;
  }
}
