import { Directive, ElementRef, OnChanges, SimpleChanges, inject, input } from '@angular/core';

import { TOOL_PLACEHOLDER_URL, normalizeImageUrl } from './image-url.util';

@Directive({
  selector: 'img[appResolvedSrc]',
  standalone: true,
})
export class ResolvedImageDirective implements OnChanges {
  private readonly elementRef = inject<ElementRef<HTMLImageElement>>(ElementRef);

  readonly appResolvedSrc = input('');

  ngOnChanges(changes: SimpleChanges): void {
    if ('appResolvedSrc' in changes) {
      const normalizedUrl = normalizeImageUrl(this.appResolvedSrc()) || TOOL_PLACEHOLDER_URL;
      this.elementRef.nativeElement.src = normalizedUrl;
    }
  }
}
