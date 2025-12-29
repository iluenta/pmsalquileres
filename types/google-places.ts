// Tipos para Google Places API

export interface PlaceSearchResult {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  photos?: PlacePhoto[]
  types?: string[]
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

export interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  photos?: PlacePhoto[]
  editorial_summary?: {
    overview: string
  }
  types?: string[]
  formatted_phone_number?: string
  website?: string
  url?: string // URL de Google Maps
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

export interface PlacePhoto {
  photo_reference: string
  height: number
  width: number
}

export interface GooglePlacesTextSearchResponse {
  results: PlaceSearchResult[]
  status: string
  error_message?: string
}

export interface GooglePlacesDetailsResponse {
  result: PlaceDetails
  status: string
  error_message?: string
}

