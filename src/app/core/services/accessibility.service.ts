import { Injectable, signal } from '@angular/core';

type FontScale = 'normal' | 'large' | 'xl';

const FONT_KEY = 'billerfast_font';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  readonly scale = signal<FontScale>(this.load());
  readonly label = signal<string>(this.labelFor(this.load()));

  constructor() {
    this.apply();
  }

  next(): void {
    const order: FontScale[] = ['normal', 'large', 'xl'];
    const idx = order.indexOf(this.scale());
    const next = order[(idx + 1) % order.length];
    this.scale.set(next);
    this.label.set(this.labelFor(next));
    localStorage.setItem(FONT_KEY, next);
    this.apply();
  }

  private apply(): void {
    document.documentElement.setAttribute('data-font', this.scale());
  }

  private labelFor(scale: FontScale): string {
    return scale === 'normal' ? 'A' : scale === 'large' ? 'A+' : 'A++';
  }

  private load(): FontScale {
    const s = localStorage.getItem(FONT_KEY);
    return s === 'large' || s === 'xl' ? s : 'normal';
  }
}