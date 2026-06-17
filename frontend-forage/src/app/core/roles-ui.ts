export const ROLE_UI: Record<string, { label: string; icon: string; class: string }> = {
  admin: {
    label: 'Admin',
    icon: 'fa fa-crown',
    class: 'bg-primary',
  },
  editor: {
    label: 'Éditeur',
    icon: 'fa fa-pen',
    class: 'bg-warning',
  },
  user: {
    label: 'Utilisateur',
    icon: 'fa fa-user',
    class: 'bg-info',
  },
  commercial: {
    label: 'Commercial',
    icon: 'fa fa-briefcase',
    class: 'bg-success',
  },
};