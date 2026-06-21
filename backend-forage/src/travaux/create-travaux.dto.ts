export class CreateTravauxDto {
  titre!: string;
  description?: string;
  status?: 'en_cours' | 'termine' | 'planifie';
  date_debut?: string;
  date_fin?: string;
  localisation?: string;
  equipe_id?: number;

  // index de l'image principale parmi les fichiers uploadés
  // ex: "0"
  photoPrincipaleIndex?: string;
  legends?: string | string[];
}
