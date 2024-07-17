import { Component } from '@angular/core';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrl: './slideshow.component.scss'
})
export class SlideshowComponent {
  slides = [
    { image: '../../../../assets/images/pettwo.png' },
    { image: '../../../../assets/images/fourp.png' },
  ];
  currentSlide = 0;

  ngOnInit(): void {
    this.startSlideshow();
  }

  changeSlide(n: number): void {
    this.currentSlide = (this.currentSlide + n + this.slides.length) % this.slides.length;
  }

  startSlideshow(): void {
    setInterval(() => {
      this.changeSlide(1);
    }, 3000); // Change slide every 3 seconds
  }
}
