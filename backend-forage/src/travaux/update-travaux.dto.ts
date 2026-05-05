export type TravauxStatus = 'planifie' | 'en_cours' | 'termine';
export class UpdateTravauxDto {
  titre?: string;
  description?: string;
  status?: TravauxStatus;
  date_debut?: string;
  date_fin?: string;
  localisation?: string;
  equipe_id?: number | string;

  photoPrincipaleIndex?: number | string;
  legends?: string[] | string;

  existingMainUrl?: string;
  existingLegendUpdates?: string; // JSON string
}
