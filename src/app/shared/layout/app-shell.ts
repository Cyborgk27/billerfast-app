import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { PwaInstallService } from '../../core/services/pwa-install.service';
import { AccessibilityService } from '../../core/services/accessibility.service';
import { imageUrl } from '../../core/utils/media-url';
import { ProfileDialog } from '../components/profile-dialog';
import { InstallDialog } from '../components/install-dialog';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Inicio', icon: 'home' },
  { path: '/productos', label: 'Productos', icon: 'box' },
  { path: '/clientes', label: 'Clientes', icon: 'users' },
  { path: '/facturas', label: 'Facturas', icon: 'receipt' },
];

@Component({
  selector: 'app-shell',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  styleUrl: './app-shell.css',
  templateUrl: './app-shell.html',
})
export class AppShell implements OnInit {
  protected readonly isMobile = signal(false);
  protected readonly navItems = NAV_ITEMS;
  protected readonly currentUser = inject(AuthService).currentUser;
  protected readonly isAdmin = computed(() => this.currentUser()?.rol === 'Admin');
  protected readonly canManage = computed(() => {
    const rol = this.currentUser()?.rol;
    return rol === 'Admin' || rol === 'User';
  });
  protected readonly canSettings = computed(() => {
    const rol = this.currentUser()?.rol;
    return rol === 'Admin' || rol === 'User';
  });
  protected readonly fontLabel = inject(AccessibilityService).label;
  protected readonly isDark = inject(ThemeService).isDark;

  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly pwaInstallService = inject(PwaInstallService);
  private readonly accessibilityService = inject(AccessibilityService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(max-width: 599.98px)'])
      .subscribe((state) => this.isMobile.set(state.matches));
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  cycleFont(): void {
    this.accessibilityService.next();
  }

  onInstall(): void {
    if (this.pwaInstallService.canInstall()) {
      this.pwaInstallService.install();
    } else {
      this.dialog.open(InstallDialog, { width: '420px' });
    }
  }

  avatarUrl(): string {
    const id = this.currentUser()?.id_publico;
    return id ? imageUrl(`/api/images/user/${id}`) : '';
  }

  openProfile(): void {
    this.dialog.open(ProfileDialog, { width: '420px' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}