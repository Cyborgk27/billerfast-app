import { Injectable, computed, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'billerfast_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.load());
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    this.apply();
  }

  toggle(): void {
    this.mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
    localStorage.setItem(THEME_KEY, this.mode());
    this.apply();
  }

  private apply(): void {
    document.documentElement.classList.toggle('dark', this.mode() === 'dark');
  }

  private load(): ThemeMode {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}