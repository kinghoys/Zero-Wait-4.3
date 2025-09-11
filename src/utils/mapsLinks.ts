type Coords = { lat: number; lng: number };

const enc = encodeURIComponent;

export const buildMapsSearchLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${enc(query)}`;

// Either origin coords OR an origin query like "My Location, Hyderabad"
export function buildMapsDirectionsLink(params: {
  originCoords?: Coords;
  originQuery?: string;
  destinationCoords?: Coords;
  destinationQuery?: string; // e.g., "Apollo Hospital Jubilee Hills Hyderabad"
  travelMode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}): string {
  const mode = params.travelMode ?? 'driving';

  const origin = params.originCoords
    ? `${params.originCoords.lat},${params.originCoords.lng}`
    : (params.originQuery ? enc(params.originQuery) : 'My+Location');

  const destination = params.destinationCoords
    ? `${params.destinationCoords.lat},${params.destinationCoords.lng}`
    : (params.destinationQuery ? enc(params.destinationQuery) : '');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}`;
}

// Generic Google search link (for fees, reviews, phone, website)
export const buildGoogleSearchLink = (query: string) =>
  `https://www.google.com/search?q=${enc(query)}`;

// Common hospital queries
export function buildHospitalQueries(h: {
  name: string;
  city?: string;
  specialty?: string;
}) {
  const base = [h.name, h.specialty, h.city].filter(Boolean).join(' ');
  return {
    search: buildMapsSearchLink(base),
    reviews: buildGoogleSearchLink(`${base} reviews`),
    fees: buildGoogleSearchLink(`${base} consultation fees`),
    phone: buildGoogleSearchLink(`${base} phone`),
    website: buildGoogleSearchLink(`${base} official website`),
  };
}
