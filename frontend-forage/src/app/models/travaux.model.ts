export interface TravauxPhoto {
  id: number;
  image: string;
  legenda?: string | null;
  travaux_id: number;
}

export interface TravauxModel {
  id: number;
  titre: string;
  description?: string | null;
  status: 'en_cours' | 'termine' | 'planifie';
  date_debut?: string | null;
  date_fin?: string | null;
  localisation?: string | null;
  photo_principale?: string | null;
  photos: TravauxPhoto[];
  created_at: string;
}


