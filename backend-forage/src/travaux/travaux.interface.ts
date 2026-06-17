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

    photos: TravauxPhoto[];

    created_at: string;
}

export interface TravauxPhoto {
    id: number;
    image: string;
    legenda: string;
    created_at?: string;
}