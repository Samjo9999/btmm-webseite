
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

type Cell = {
  name: string
  city: string
  country: string
  lat: number
  lng: number
  status: string
}

// Fix leaflet default icon paths in Next.js (must be done at module level for SSR safety)
function fixLeafletIcons() {
  const iconProto = L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown }
  delete iconProto._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

export default function LeafletMapInner({ cells }: { cells: Cell[] }) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  const center: [number, number] = [48.0, 9.0]

  return (
    <MapContainer
      center={center}
      zoom={3}
      style={{ height: 480, width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {cells.map((cell, index) => (
        <Marker key={index} position={[cell.lat, cell.lng]}>
          <Popup>
            <div style={{ fontFamily: 'var(--font-garamond)', minWidth: 140 }}>
              <strong style={{ color: 'var(--btb-rot)', display: 'block', marginBottom: 4 }}>
                {cell.name}
              </strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {cell.city}, {cell.country}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
