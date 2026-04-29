import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss']
})
export class SiteHeaderComponent {
  @Input() content: any;
  @Input() contact: any;
  @Input() contactOpen = false;
  @Input() contactClosing = false;
  @Input() regionCode = 'US';
  @Input() navOpen = false;
  @Input() whatsappLink: string | null = null;

  @Output() toggleNav = new EventEmitter<void>();
  @Output() closeNav = new EventEmitter<void>();
  @Output() toggleContact = new EventEmitter<void>();
  @Output() switchLanguage = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.navOpen) return;
    const target = event.target as Node;
    if (!this.el.nativeElement.contains(target)) {
      this.closeNav.emit();
    }
  }
}
