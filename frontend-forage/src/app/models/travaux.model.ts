export interface TravauxModel {
  id: number;
  titre: string;
  description?: string | null;
  status: 'en_cours' | 'termine' | 'planifie';
  date_debut?: string | null;
  date_fin?: string | null;
  localisation?: string | null;
  photo_principale?: string | null;
  medias: TravauxMedia[];
  created_at: string;
}

export interface TravauxMedia {
  id: number;
  media: string;
  type: 'image' | 'video';
  legenda?: string | null;
  thumbnail?: string | null;
}