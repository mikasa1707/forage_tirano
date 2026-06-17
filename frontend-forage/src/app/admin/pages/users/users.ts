import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersAdminService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';
import { Role, ROLES } from '../../../core/roles';
import { ROLE_UI } from '../../../core/roles-ui';

type AdminUser = {
  id: number;
  username: string;
  role: Role;
};

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  users: AdminUser[] = [];
  error = '';
  users$: any;

  roles = ROLES;
  roleUI = ROLE_UI;

  form = {
    username: '',
    password: '',
    role: 'user',
  };

  constructor(
    private readonly usersService: UsersAdminService,
    public readonly auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) { }

  isOpen = false;

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  getRole() {
    this.auth.getRole();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.findAll().subscribe({
      next: (res: AdminUser[]) => {
        this.users$ = this.usersService.findAll();
        this.users = res;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Impossible de charger les utilisateurs';
      },
    });
  }

  createUser(): void {
    this.error = '';

    this.usersService.create(this.form).subscribe({
      next: () => {
        this.form = {
          username: '',
          password: '',
          role: 'user',
        };
        this.loadUsers();
        this.resetForm();
        this.closeModal();
      },
      error: (err: { error: { message: string } }) => {
        this.error = err?.error?.message || 'Erreur lors de la création';
      },
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Supprimer cet utilisateur ?')) {
      return;
    }

    this.usersService.remove(id).subscribe({
      next: () => this.loadUsers(),
      error: () => {
        this.error = 'Erreur lors de la suppression';
      },
    });
  }

  resetForm() {
    this.form = {
      username: '',
      password: '',
      role: 'user',
    };
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-primary';
      case 'editor':
        return 'bg-warning';
      case 'user':
        return 'bg-info';
      case 'commercial':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getRoleUI(role: string) {
    return this.roleUI[role] ?? {
      label: role,
      icon: 'fa fa-question',
      class: 'bg-secondary',
    };
  }
}
