export interface GooglePlacesSuggestion {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings: Array<{
      offset: number;
      length: number;
    }>;
  };
  terms: Array<{
    offset: number;
    value: string;
  }>;
  types: string[];
  reference: string;
  matched_substrings?: Array<{
    length: number;
    offset: number;
  }>;
}

export interface PlaceDetails {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
    viewport: {
      south: number;
      west: number;
      north: number;
      east: number;
    };
  };
  place_id: string;
  types: string[];
  name?: string;
}
