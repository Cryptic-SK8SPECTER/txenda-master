export interface FilterState {
  quickFilters: string[];
  distance: number;
  city: string;
  country: string;
  ageRange: [number, number];
  gender: string;
  status: string;
  intentions: string[];
  profileTypes: string[];
  popularity: string[];
  contentType: string;
  priceRange: [number, number];
  categories: string[];
  creatorRating: string;
  contentDate: string;
  searchTerm: string;
}

export const defaultFilters: FilterState = {
  quickFilters: [],
  distance: 25,
  city: "",
  country: "",
  ageRange: [18, 45],
  gender: "all",
  status: "any",
  intentions: [],
  profileTypes: [],
  popularity: [],
  contentType: "ambos",
  priceRange: [0, 100000],
  categories: [],
  creatorRating: "",
  contentDate: "",
  searchTerm: "",
};
