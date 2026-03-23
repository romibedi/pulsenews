// ---------------------------------------------------------------------------
// City feeds — Latin America
// ---------------------------------------------------------------------------

export const CITY_FEEDS_LATAM = {
  'sao-paulo': {
    label: 'São Paulo', region: 'latam', country: 'BR',
    lang: 'pt', lat: -23.5505, lng: -46.6333,
    feeds: [
      { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', source: 'Folha de S.Paulo' },
      { url: 'https://riotimesonline.com/feed/', source: 'Rio Times' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', source: 'Agência Brasil' },
    ],
  },
  'mexico-city': {
    label: 'Mexico City', region: 'latam', country: 'MX',
    lang: 'es', lat: 19.4326, lng: -99.1332,
    feeds: [
      { url: 'https://www.excelsior.com.mx/rss.xml', source: 'Excelsior' },
      { url: 'https://mexiconewsdaily.com/feed/', source: 'Mexico News Daily' },
      { url: 'https://www.eluniversal.com.mx/rss.xml', source: 'El Universal' },
    ],
  },
  'buenos-aires': {
    label: 'Buenos Aires', region: 'latam', country: 'AR',
    lang: 'es', lat: -34.6037, lng: -58.3816,
    feeds: [
      { url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', source: 'La Nacion' },
      { url: 'https://buenosairesherald.com/feed/', source: 'Buenos Aires Herald' },
      { url: 'https://en.mercopress.com/rss', source: 'MercoPress' },
    ],
  },
  bogota: {
    label: 'Bogotá', region: 'latam', country: 'CO',
    lang: 'es', lat: 4.711, lng: -74.0721,
    feeds: [
      { url: 'https://www.eltiempo.com/rss/eltiempo.xml', source: 'El Tiempo' },
      { url: 'https://colombiareports.com/feed/', source: 'Colombia Reports' },
      { url: 'https://thecitypaperbogota.com/feed/', source: 'The City Paper Bogota' },
    ],
  },
  lima: {
    label: 'Lima', region: 'latam', country: 'PE',
    lang: 'es', lat: -12.0464, lng: -77.0428,
    feeds: [
      { url: 'https://gestion.pe/feed/', source: 'Gestion Peru' },
      { url: 'https://perureports.com/feed/', source: 'Peru Reports' },
    ],
  },
  santiago: {
    label: 'Santiago', region: 'latam', country: 'CL',
    lang: 'es', lat: -33.4489, lng: -70.6693,
    feeds: [
      { url: 'https://www.latercera.com/feed/', source: 'La Tercera' },
      { url: 'https://santiagotimes.cl/feed/', source: 'Santiago Times' },
    ],
  },
  'rio-de-janeiro': {
    label: 'Rio de Janeiro', region: 'latam', country: 'BR',
    lang: 'pt', lat: -22.9068, lng: -43.1729,
    feeds: [
      { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', source: 'Folha de S.Paulo' },
      { url: 'https://riotimesonline.com/feed/', source: 'Rio Times Online' },
      { url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', source: 'Agência Brasil' },
    ],
  },
  medellin: {
    label: 'Medellín', region: 'latam', country: 'CO',
    lang: 'es', lat: 6.2442, lng: -75.5812,
    feeds: [
      { url: 'https://www.elcolombiano.com/rss/portada.xml', source: 'El Colombiano' },
      { url: 'https://colombiareports.com/feed/', source: 'Colombia Reports' },
    ],
  },
  // Cities without explicit region in original (Latin American)
  guadalajara: {
    label: 'Guadalajara',
    lang: 'es',
    coords: [20.6597, -103.3496],
    feeds: [
      { url: 'https://www.informador.mx/rss/ultimas-noticias.xml', source: 'El Informador' },
    ],
  },
  monterrey: {
    label: 'Monterrey',
    lang: 'es',
    coords: [25.6866, -100.3161],
    feeds: [
      { url: 'https://www.elnorte.com/rss/portada.xml', source: 'El Norte' },
    ],
  },
  caracas: {
    label: 'Caracas',
    lang: 'es',
    coords: [10.4806, -66.9036],
    feeds: [
      { url: 'https://venezuelanalysis.com/feed', source: 'Venezuelanalysis' },
    ],
  },
  quito: {
    label: 'Quito',
    lang: 'es',
    coords: [-0.1807, -78.4678],
    feeds: [
      { url: 'https://www.ecuadortimes.net/feed/', source: 'Ecuador Times' },
    ],
  },
  montevideo: {
    label: 'Montevideo',
    lang: 'es',
    coords: [-34.9011, -56.1645],
    feeds: [
      { url: 'https://en.mercopress.com/rss', source: 'MercoPress' },
    ],
  },
};
