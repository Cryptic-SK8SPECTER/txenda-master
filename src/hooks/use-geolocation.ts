import { useState, useEffect } from "react";

export interface GeoLocation {
  lat: number;
  lng: number;
}

type GeoStatus = "idle" | "requesting" | "granted" | "denied";

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    setStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus("granted");
      },
      () => {
        setStatus("denied");
      },
    );
  }, []);

  return { location, status };
}
