import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchByCategory } from '../api/newsApi';
import { groupArticlesByRegion } from '../utils/regions';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
function createIcon(count) {
  const size = Math.min(18 + count * 3, 40);
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:#e05d44;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function WorldMap() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.all(
          ['world', 'us-news', 'uk-news', 'technology', 'business'].map((cat) =>
            fetchByCategory(cat, 1).then((d) => d.articles)
          )
        );
        const all = results.flat();
        setRegions(groupArticlesByRegion(all));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">World Map</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">News stories plotted by region</p>
      </div>

      {loading ? (
        <div className="aspect-[16/9] rounded-2xl shimmer" />
      ) : (
        <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-md">
          <MapContainer
            center={[25, 10]}
            zoom={2}
            minZoom={2}
            style={{ height: '70vh', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />
            {regions.map((region) => (
              <Marker
                key={`${region.lat}-${region.lng}`}
                position={[region.lat, region.lng]}
                icon={createIcon(region.articles.length)}
              >
                <Popup>
                  <div style={{ maxWidth: 260, maxHeight: 300, overflow: 'auto' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{region.label}</p>
                    {region.articles.slice(0, 5).map((a) => (
                      <div key={a.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #eee' }}>
                        <a
                          href={a.isExternal ? a.url : `/article/${encodeURIComponent(a.id)}`}
                          target={a.isExternal ? '_blank' : '_self'}
                          style={{ fontSize: 12, color: '#e05d44', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {a.title}
                        </a>
                        <p style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{a.source || 'The Guardian'}</p>
                      </div>
                    ))}
                    {region.articles.length > 5 && (
                      <p style={{ fontSize: 10, color: '#999' }}>+{region.articles.length - 5} more</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
