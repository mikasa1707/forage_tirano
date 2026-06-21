export interface Travaux {
  id: number;
  titre: string;
  description?: string;
  status: 'en_cours' | 'termine' | 'planifie';
  date_debut?: string;
  date_fin?: string;
  localisation?: string;
  photo_principale?: string;
  equipe_id?: number;
  medias: TravauxMedia[];
  created_at: string;
}

export interface TravauxMedia {
  id: number;
  media: string;
  type: 'image' | 'video';
  legenda: string;
  created_at?: string;
}
