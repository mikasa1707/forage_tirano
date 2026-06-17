export interface Contact {
  id: number;

  nom: string;
  email: string;
  telephone: string;

  sujet?: string;
  message: string;

  status: 'nouveau' | 'lu' | 'traite';

  createdAt: string;
}