import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { basicUrl } from "@/utils/index";

// Ajustar o ícone default do leaflet para ambientes React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapViewProps {
  users: any[];
  currentLocation?: { lat: number; lng: number } | null;
  selectedUserForRoute?: any | null;
  loggedInUser?: any | null;
}

// Componente para traçar a rota (deve estar denro do MapContainer)
const RoutingMachine = ({
  start,
  end,
}: {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    // Removemos qualquer control route anterior 
    map.eachLayer((layer: any) => {
       if (layer.options && layer.options.route) {
         map.removeLayer(layer);
       }
    });

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false, // para não adicionar pontos a meio do caminho ao clicar
      show: false, // não mostra a caixa de instruções para ficar o UI mais limpo
      fitSelectedRoutes: true, // faz zoo in automatico na rota
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
    }).addTo(map);

    return () => {
      if (map) {
         map.removeControl(routingControl);
      }
    };
  }, [map, start, end]);

  return null;
};

// Componente de redimensionamento e centralização
const MapRefocus = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const MapView = ({ users, currentLocation, selectedUserForRoute, loggedInUser }: MapViewProps) => {
  // Posição do Utilizador Logado Atual (GPS > Base de Dados)
  let startPos: { lat: number; lng: number } | null = null;

  if (currentLocation) {
    startPos = currentLocation;
  } else if (loggedInUser?.location?.coordinates?.length >= 2) {
    startPos = {
      lat: loggedInUser.location.coordinates[1],
      lng: loggedInUser.location.coordinates[0],
    };
  }

  // Posição padrão caso não haja nenhuma (Maputo)
  const defaultPosition: [number, number] = startPos 
     ? [startPos.lat, startPos.lng]
     : [-25.891968, 32.605135];

  // Cria um ícone customizado se o user tiver foto
  const createCustomIcon = (user: any) => {
    return L.divIcon({
      className: "custom-avatar-marker",
      html: `<div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid ${user.isOnline ? '#22c55e' : '#fff'}; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
               <img src="${user.profile?.photo ? `${basicUrl}img/users/${user.profile.photo}` : 'https://ui-avatars.com/api/?name=' + user.name}" style="width: 100%; height: 100%; object-fit: cover;" />
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden z-0">
      <MapContainer 
        center={defaultPosition} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {startPos && (
          <MapRefocus center={[startPos.lat, startPos.lng]} />
        )}

        {/* Marker da Posição Atual do Utilizador  */}
        {startPos && (
          <Marker position={[startPos.lat, startPos.lng]}>
             <Popup>
               <div className="font-semibold">Tu estás aqui</div>
             </Popup>
          </Marker>
        )}

        {/* Markers de todos os users carregados */}
        {users.map((user) => {
          if (!user.location?.coordinates || user.location.coordinates.length < 2) return null;
          
          // O MongoDB guarda as coordenadas como [longitude, latitude]
          const lat = user.location.coordinates[1];
          const lng = user.location.coordinates[0];

          return (
            <Marker 
              key={user._id} 
              position={[lat, lng]}
              icon={createCustomIcon(user)}
            >
              <Popup>
                <div className="text-center min-w-[120px]">
                  <h3 className="font-bold text-sm">{user.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{user.gender === 'm' ? 'Masculino' : user.gender === 'f' ? 'Feminino' : user.gender}</p>
                  <p className="text-xs font-semibold text-primary">{user.distance ? user.distance : 'Perto'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Lógica da Rota se um user estiver selecionado */}
        {startPos && selectedUserForRoute && selectedUserForRoute.location?.coordinates && (
           <RoutingMachine 
              start={{ lat: startPos.lat, lng: startPos.lng }}
              end={{ 
                lat: selectedUserForRoute.location.coordinates[1], 
                lng: selectedUserForRoute.location.coordinates[0] 
              }}
           />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
