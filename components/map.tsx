import React, { useState, useEffect, useRef, JSX } from "react";
import { Locate } from "lucide-react";
import Swal from "sweetalert2";

// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

// Google Maps type declarations
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds): void;
      addListener(eventName: string, handler: Function): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latlng: LatLng | LatLngLiteral | null): void;
      addListener(eventName: string, handler: Function): void;
    }

    class Geocoder {
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[] | null, status: string) => void
      ): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    class Circle {
      constructor(opts?: CircleOptions);
      setMap(map: Map | null): void;
      getBounds(): LatLngBounds;
    }
    class Polygon {
      constructor(opts?: PolygonOptions);
      setMap(map: Map | null): void;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      styles?: any[];
    }

    interface MarkerOptions {
      map?: Map;
      position?: LatLng | LatLngLiteral;
      draggable?: boolean;
      animation?: any;
    }
    interface CircleOptions {
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
      center?: LatLng | LatLngLiteral;
      radius?: number;
      clickable: boolean;
    }
    interface PolygonOptions {
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
      paths?: Array<LatLngLiteral[]> | LatLngLiteral[];
      clickable?: boolean;
    }

    interface MapMouseEvent {
      latLng: LatLng | null;
    }

    interface GeocoderRequest {
      location?: LatLng | LatLngLiteral;
    }

    interface GeocoderResult {
      formatted_address: string;
      address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
      geometry?: {
        location: LatLng;
        viewport?: LatLngBounds;
      };
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(latlng: LatLng | LatLngLiteral): void;
      contains(latlng: LatLng | LatLngLiteral): boolean;
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
    }

    enum Animation {
      DROP = 1,
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        bindTo(key: string, target: any): void;
        addListener(eventName: string, handler: Function): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {}

      interface PlaceResult {
        formatted_address?: string;
        geometry?: {
          location: LatLng;
          viewport?: LatLngBounds;
        };
      }
    }
    namespace geometry {
      namespace poly {
        function containsLocation(point: LatLng, polygon: Polygon): boolean;
      }
    }
  }
}

interface LatLng {
  lat: number;
  lng: number;
}

interface MapInstance {
  map: google.maps.Map | null;
  marker: google.maps.Marker | null;
  autocomplete: google.maps.places.Autocomplete | null;
  radiusCircle: google.maps.Circle | null;
  townPolygons?: google.maps.Polygon[] | null;
}

// Location data to be stored in DB
export interface LocationData {
  address: string;
  coordinates: LatLng | null;
  locationName?: string;
}
export interface RadiusLimit {
  center: LatLng; // Center point for radius restriction
  radiusKm: number; // Radius in kilometers
}
export interface TownLimit {
  center: LatLng;
}

// Component Props
interface AddressLocationSelectorProps {
  value: LocationData;
  onChange?: (data: LocationData) => void;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  radiusLimit?: RadiusLimit; // New prop for radius limitation
  townLimit?: TownLimit;
}

// Label Component
const Label = ({ htmlFor, className, children }: any) => (
  <label htmlFor={htmlFor} className={className}>
    {children}
  </label>
);

// Input Component
const Input = ({ className, ...props }: any) => (
  <input
    className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

export default function AddressLocationSelector({
  value,
  onChange,
  readOnly = false,
  label = "Registered Business Address",
  placeholder = "Enter Your Address",
  className = " w-full h-[490px] rounded-xl ",
  radiusLimit,
  townLimit,
}: AddressLocationSelectorProps): JSX.Element {
  const [mapCenter, setMapCenter] = useState<LatLng>(() => {
    if (townLimit?.center) return townLimit.center;
    if (radiusLimit?.center) return radiusLimit.center;
    if (value.coordinates) return value.coordinates;
    return { lat: 38.6431, lng: 34.852 };
  });
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const mapRef = useRef<MapInstance>({
    map: null,
    marker: null,
    autocomplete: null,
    radiusCircle: null,
    townPolygons: null,
  });
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const [townName, setTownName] = useState<string | null>(null);
  const [townBounds, setTownBounds] = useState<google.maps.LatLngBounds | null>(null);
  const calculateDistance = (point1: LatLng, point2: LatLng): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if a point is within the allowed radius
  const isWithinRadius = (point: LatLng): boolean => {
    if (!radiusLimit) return true;
    const distance = calculateDistance(radiusLimit.center, point);
    return distance <= radiusLimit.radiusKm;
  };
  const isWithinTown = (point: LatLng): boolean => {
    if (!townLimit) return true;
    const townPolys = mapRef.current.townPolygons || [];
    if (townPolys && townPolys.length > 0 && google.maps.geometry?.poly) {
      const ll = new google.maps.LatLng(point.lat, point.lng);
      for (const poly of townPolys) {
        if (google.maps.geometry.poly.containsLocation(ll, poly)) return true;
      }
      return false;
    }
    if (townBounds) {
      return townBounds.contains({ lat: point.lat, lng: point.lng } as any);
    }
    return true;
  };
  const clearTownPolygons = (): void => {
    if (mapRef.current.townPolygons) {
      mapRef.current.townPolygons.forEach((p) => p.setMap(null));
    }
    mapRef.current.townPolygons = null;
  };
  const setTownPolygonsOnMap = (pathsList: Array<LatLng[]>): void => {
    clearTownPolygons();
    const polys: google.maps.Polygon[] = [];
    const bounds = new google.maps.LatLngBounds();
    pathsList.forEach((paths: any) => {
      const polygon = new google.maps.Polygon({
        strokeColor: "#2563eb",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        map: mapRef.current.map as any,
        paths: paths,
        clickable: false,
      });
      polys.push(polygon);
      (paths as LatLng[]).forEach((p: any) => {
        if (p && typeof p.lat === "number" && typeof p.lng === "number") {
          bounds.extend(p);
        }
      });
    });
    mapRef.current.townPolygons = polys;
    setTownBounds(bounds);
    if (mapRef.current.map) {
      mapRef.current.map.fitBounds(bounds);
      mapRef.current.map.setCenter(townLimit?.center || mapCenter);
    }
  };
  const boundsToRectPath = (b: google.maps.LatLngBounds): LatLng[] => {
    const sw = b.getSouthWest?.();
    const ne = b.getNorthEast?.();
    if (sw && ne) {
      const nw = { lat: ne.lat(), lng: sw.lng() };
      const se = { lat: sw.lat(), lng: ne.lng() };
      return [
        { lat: sw.lat(), lng: sw.lng() },
        nw,
        { lat: ne.lat(), lng: ne.lng() },
        se,
        { lat: sw.lat(), lng: sw.lng() },
      ];
    }
    return [];
  };
  const fetchTownBoundary = async (): Promise<void> => {
    if (!townLimit || !mapRef.current.map) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: townLimit.center as any }, async (results, status) => {
      if (status === "OK" && results && results[0]) {
        const comps = results[0].address_components || [];
        let name: string | null = null;
        for (const c of comps) {
          if (c.types.includes("locality")) {
            name = c.long_name;
            break;
          }
        }
        if (!name) {
          for (const c of comps) {
            if (c.types.includes("administrative_area_level_3") || c.types.includes("administrative_area_level_2")) {
              name = c.long_name;
              break;
            }
          }
        }
        setTownName(name);
        try {
          if (name) {
            const url = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q=${encodeURIComponent(
              name
            )}`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
              let closest = data[0];
              let minDist = Number.MAX_VALUE;
              data.forEach((item: any) => {
                const ilat = parseFloat(item.lat);
                const ilon = parseFloat(item.lon);
                const d = calculateDistance({ lat: ilat, lng: ilon }, townLimit.center);
                if (!isNaN(d) && d < minDist) {
                  minDist = d;
                  closest = item;
                }
              });
              const gj = closest.geojson;
              if (gj && (gj.type === "Polygon" || gj.type === "MultiPolygon")) {
                if (gj.type === "Polygon") {
                  const coords = gj.coordinates?.[0] || [];
                  const path: LatLng[] = coords.map((pt: any) => ({ lat: pt[1], lng: pt[0] }));
                  setTownPolygonsOnMap([path] as any);
                  return;
                }
                if (gj.type === "MultiPolygon") {
                  const pathsList: LatLng[][] = [];
                  gj.coordinates.forEach((poly: any) => {
                    const ring = poly[0] || [];
                    const path: LatLng[] = ring.map((pt: any) => ({ lat: pt[1], lng: pt[0] }));
                    pathsList.push(path);
                  });
                  setTownPolygonsOnMap(pathsList as any);
                  return;
                }
              }
            }
          }
          const vp = results[0].geometry?.viewport;
          if (vp) {
            setTownBounds(vp);
            if (mapRef.current.map) mapRef.current.map.fitBounds(vp);
            const rectPath = boundsToRectPath(vp);
            if (rectPath.length > 0) setTownPolygonsOnMap([rectPath]);
          }
        } catch {
          const vp = results[0].geometry?.viewport;
          if (vp) {
            setTownBounds(vp);
            if (mapRef.current.map) mapRef.current.map.fitBounds(vp);
            const rectPath = boundsToRectPath(vp);
            if (rectPath.length > 0) setTownPolygonsOnMap([rectPath]);
          }
        }
      }
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google?.maps) {
      setIsMapLoaded(true);
      return;
    }
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyA7sg-dUaG5v6JWizJoU_0E608O2ePDxz0";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (isMapLoaded && window.google && !mapRef.current.map) {
      initializeMap();
    }
  }, [isMapLoaded]);
  useEffect(() => {
    if (!mapRef.current.map) return;
    if (readOnly) return;
    if (townLimit) {
      fetchTownBoundary();
    } else {
      clearTownPolygons();
      setTownBounds(null);
      setTownName(null);
    }
    if (radiusLimit) {
      if (mapRef.current.radiusCircle) {
        mapRef.current.radiusCircle.setMap(null);
      }
      const circle = new google.maps.Circle({
        strokeColor: "#2563eb",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        map: mapRef.current.map,
        center: radiusLimit.center,
        radius: radiusLimit.radiusKm * 1000,
        clickable: false,
      });
      mapRef.current.radiusCircle = circle;
      const b = circle.getBounds?.();
      if (b) mapRef.current.map.fitBounds(b as any);
      mapRef.current.map.setCenter(radiusLimit.center);
    } else {
      if (mapRef.current.radiusCircle) {
        mapRef.current.radiusCircle.setMap(null);
        mapRef.current.radiusCircle = null;
      }
    }
  }, [townLimit, radiusLimit, readOnly]);

  // Update map when value changes externally
  useEffect(() => {
    if (mapRef.current.map && mapRef.current.marker && value.coordinates) {
      mapRef.current.map.setCenter(value.coordinates);
      mapRef.current.marker.setPosition(value.coordinates);
      setMapCenter(value.coordinates);
    }
  }, [value.coordinates]);

  const initializeMap = (): void => {
    const mapElement = mapContainerRef.current;
    if (!mapElement) return;
    const initialCenter = townLimit ? townLimit.center : radiusLimit ? radiusLimit.center : mapCenter;

    const map = new google.maps.Map(mapElement, {
      center: initialCenter,
      zoom: value.coordinates ? 15 : 14,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "on" }],
        },
      ],
    });
    if (townLimit && !readOnly) {
      fetchTownBoundary();
    }
    if (radiusLimit && !readOnly) {
      const circle = new google.maps.Circle({
        strokeColor: "#2563eb",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        map: map,
        center: radiusLimit.center,
        radius: radiusLimit.radiusKm * 1000, // Convert km to meters
        clickable: false, // Make circle non-clickable so map clicks work
      });
      mapRef.current.radiusCircle = circle;

      // Fit map to show the entire circle
      const b = circle.getBounds?.();
      if (b) map.fitBounds(b as any);
    }

    // Add marker
    const marker = new google.maps.Marker({
      map: map,
      position: value.coordinates || undefined,
      draggable: !readOnly,
      animation: google.maps.Animation.DROP,
    });

    mapRef.current.map = map;
    mapRef.current.marker = marker;

    if (!readOnly) {
      // Click on map to set marker
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (townLimit && !isWithinTown(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Selected location is outside the allowed town boundary. Please select a location within the restricted area.`,
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }
          // Check if within radius limit
          if (radiusLimit && !isWithinRadius(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Selected location is outside the allowed ${radiusLimit.radiusKm}km radius. Please select a location within the restricted area.`,
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }

          marker.setPosition(e.latLng);
          reverseGeocode(e.latLng, newCoords);
        }
      });

      // Drag marker
      marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (townLimit && !isWithinTown(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Marker cannot be placed outside the allowed town boundary. Resetting to previous position.`,
              timer: 1500,
              showConfirmButton: false,
            });
            marker.setPosition(value.coordinates || townLimit.center || null);
            return;
          }
          // Check if within radius limit
          if (radiusLimit && !isWithinRadius(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Marker cannot be placed outside the allowed ${radiusLimit.radiusKm}km radius. Resetting to previous position.`,
              timer: 1500,
              showConfirmButton: false,
            });

            // Reset marker to previous valid position
            marker.setPosition(value.coordinates || radiusLimit.center || null);
            return;
          }

          reverseGeocode(e.latLng, newCoords);
        }
      });

      // Initialize autocomplete
      const input = addressInputRef.current as HTMLInputElement | null;
      if (input) {
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo("bounds", map);
        mapRef.current.autocomplete = autocomplete;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;
          const newCoords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          if (townLimit && !isWithinTown(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Selected address is outside the allowed town boundary. Please choose an address within the restricted area.`,
              timer: 1500,
              showConfirmButton: false,
            });

            return;
          }
          // Check if within radius limit
          if (radiusLimit && !isWithinRadius(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Selected address is outside the allowed ${radiusLimit.radiusKm}km radius. Please choose an address within the restricted area.`,
              timer: 1500,
              showConfirmButton: false,
            });

            return;
          }

          const extractPlaceName = (): string => {
            const comps = (place as any).address_components || [];
            const preferTypes = [
              "establishment",
              "point_of_interest",
              "lodging",
              "hotel",
              "premise",
              "natural_feature",
              "tourist_attraction",
              "airport",
              "transit_station",
            ];
            for (const t of preferTypes) {
              const c = comps.find((x: any) => Array.isArray(x.types) && x.types.includes(t));
              if (c?.long_name) return c.long_name;
            }
            const nameFromFormatted = (place.formatted_address || "").split(",")[0]?.trim();
            return nameFromFormatted || "";
          };

          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
          }

          marker.setPosition(place.geometry.location);
          if (onChange) {
            onChange({
              address: place.formatted_address || "",
              coordinates: newCoords,
              locationName: extractPlaceName(),
            });
          }
        });
      }
    }
  };

  const reverseGeocode = (
    latLng: google.maps.LatLng | LatLng,
    coords: LatLng
  ): void => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results && results[0] && onChange) {
        const comps = results[0].address_components || [];
        const preferTypes = [
          "establishment",
          "point_of_interest",
          "lodging",
          "hotel",
          "premise",
          "natural_feature",
          "tourist_attraction",
          "airport",
          "transit_station",
        ];
        let locName = "";
        for (const t of preferTypes) {
          const c = comps.find((x) => Array.isArray(x.types) && x.types.includes(t));
          if ((c as any)?.long_name) {
            locName = (c as any).long_name;
            break;
          }
        }
        if (!locName) {
          locName = (results[0].formatted_address || "").split(",")[0]?.trim() || "";
        }
        onChange({
          address: results[0].formatted_address,
          coordinates: coords,
          locationName: locName,
        });
      }
    });
  };

  const getCurrentLocation = (): void => {
    if (readOnly) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos: LatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (townLimit && !isWithinTown(pos)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Your current location is outside the allowed town boundary. Please select a location within the restricted area.`,
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }
          // Check if within radius limit
          if (radiusLimit && !isWithinRadius(pos)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Your current location is outside the allowed ${radiusLimit.radiusKm}km radius. Please select a location within the restricted area.`,
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }

          setMapCenter(pos);

          if (mapRef.current.map && mapRef.current.marker) {
            mapRef.current.map.setCenter(pos);
            mapRef.current.map.setZoom(15);
            mapRef.current.marker.setPosition(pos);
            reverseGeocode(pos, pos);
          }
        },
        () => {
          alert("Error: The Geolocation service failed.");
        }
      );
    } else {
      alert("Error: Your browser doesn't support geolocation.");
    }
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (!readOnly && onChange) {
      onChange({
        ...value,
        address: e.target.value,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6 w-full">
        {!readOnly && (
          <div className="space-y-1">
            <Label className="text-[14px] font-semibold">
              {label}
              {townLimit && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  {`(Limited to ${townName || "selected town"} boundary)`}
                </span>
              )}
              {!townLimit && radiusLimit && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  (Limited to {radiusLimit.radiusKm}km radius)
                </span>
              )}
            </Label>

            <div className="relative">
              <Input
                type="text"
                value={value.address}
                onChange={handleAddressChange}
                placeholder={placeholder}
                readOnly={readOnly}
                disabled={readOnly}
                className="h-[44px] bg-white w-full pe-10"
                ref={addressInputRef}
              />
              {!readOnly && (
                <button
                  onClick={getCurrentLocation}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Use current location"
                  type="button"
                >
                  <Locate className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}

        <div
          className={` relative bg-gray-200 overflow-hidden shadow-md ${className}`}
        >
          {!isMapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : null}
          <div ref={mapContainerRef} className={className}></div>
        </div>
      </div>
    </div>
  );
}

// -------- Multi-location selector (single map, multiple markers) --------
export interface MultiAddressLocationSelectorProps {
  values: LocationData[];
  onChange?: (data: LocationData[]) => void;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
  radiusLimit?: RadiusLimit;
  townLimit?: TownLimit;
  maxLocations?: number;
}

export function MultiAddressLocationSelector({
  values,
  onChange,
  readOnly = false,
  label = "Tour Addresses & Locations",
  placeholder = "Search address or click on map",
  className = " w-full h-[490px] rounded-xl ",
  radiusLimit,
  townLimit,
  maxLocations = 10,
}: MultiAddressLocationSelectorProps): JSX.Element {
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [townName, setTownName] = useState<string | null>(null);
  const [townBounds, setTownBounds] = useState<google.maps.LatLngBounds | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  const mapRef = useRef<{
    map: google.maps.Map | null;
    markers: google.maps.Marker[];
    autocomplete: google.maps.places.Autocomplete | null;
    radiusCircle: google.maps.Circle | null;
    townPolygons?: google.maps.Polygon[] | null;
  }>({
    map: null,
    markers: [],
    autocomplete: null,
    radiusCircle: null,
    townPolygons: null,
  });
  const valuesRef = useRef<LocationData[]>(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const calculateDistance = (point1: LatLng, point2: LatLng): number => {
    const R = 6371;
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const isWithinRadius = (point: LatLng): boolean => {
    if (!radiusLimit) return true;
    const distance = calculateDistance(radiusLimit.center, point);
    return distance <= radiusLimit.radiusKm;
  };
  const isWithinTown = (point: LatLng): boolean => {
    if (!townLimit) return true;
    const townPolys = mapRef.current.townPolygons || [];
    if (townPolys && townPolys.length > 0 && google.maps.geometry?.poly) {
      const ll = new google.maps.LatLng(point.lat, point.lng);
      for (const poly of townPolys) {
        if (google.maps.geometry.poly.containsLocation(ll, poly)) return true;
      }
      return false;
    }
    if (townBounds) {
      return townBounds.contains({ lat: point.lat, lng: point.lng } as any);
    }
    return true;
  };
  const clearTownPolygons = (): void => {
    if (mapRef.current.townPolygons) {
      mapRef.current.townPolygons.forEach((p) => p.setMap(null));
    }
    mapRef.current.townPolygons = null;
  };
  const setTownPolygonsOnMap = (pathsList: Array<LatLng[]>): void => {
    clearTownPolygons();
    const polys: google.maps.Polygon[] = [];
    const bounds = new google.maps.LatLngBounds();
    pathsList.forEach((paths: any) => {
      const polygon = new google.maps.Polygon({
        strokeColor: "#2563eb",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        map: mapRef.current.map as any,
        paths: paths,
        clickable: false,
      });
      polys.push(polygon);
      (paths as LatLng[]).forEach((p: any) => {
        if (p && typeof p.lat === "number" && typeof p.lng === "number") {
          bounds.extend(p);
        }
      });
    });
    mapRef.current.townPolygons = polys;
    setTownBounds(bounds);
    if (mapRef.current.map) {
      mapRef.current.map.fitBounds(bounds);
      mapRef.current.map.setCenter(townLimit?.center || bounds.getNorthEast());
    }
  };
  const boundsToRectPath = (b: google.maps.LatLngBounds): LatLng[] => {
    const sw = b.getSouthWest?.();
    const ne = b.getNorthEast?.();
    if (sw && ne) {
      const nw = { lat: ne.lat(), lng: sw.lng() };
      const se = { lat: sw.lat(), lng: ne.lng() };
      return [
        { lat: sw.lat(), lng: sw.lng() },
        nw,
        { lat: ne.lat(), lng: ne.lng() },
        se,
        { lat: sw.lat(), lng: sw.lng() },
      ];
    }
    return [];
  };
  const fetchTownBoundary = async (): Promise<void> => {
    if (!townLimit || !mapRef.current.map) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: townLimit.center as any }, async (results, status) => {
      if (status === "OK" && results && results[0]) {
        const comps = results[0].address_components || [];
        let name: string | null = null;
        for (const c of comps) {
          if (c.types.includes("locality")) {
            name = c.long_name;
            break;
          }
        }
        if (!name) {
          for (const c of comps) {
            if (c.types.includes("administrative_area_level_3") || c.types.includes("administrative_area_level_2")) {
              name = c.long_name;
              break;
            }
          }
        }
        setTownName(name);
        try {
          if (name) {
            const url = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q=${encodeURIComponent(
              name
            )}`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
              let closest = data[0];
              let minDist = Number.MAX_VALUE;
              data.forEach((item: any) => {
                const ilat = parseFloat(item.lat);
                const ilon = parseFloat(item.lon);
                const d = calculateDistance({ lat: ilat, lng: ilon }, townLimit.center);
                if (!isNaN(d) && d < minDist) {
                  minDist = d;
                  closest = item;
                }
              });
              const gj = closest.geojson;
              if (gj && (gj.type === "Polygon" || gj.type === "MultiPolygon")) {
                if (gj.type === "Polygon") {
                  const coords = gj.coordinates?.[0] || [];
                  const path: LatLng[] = coords.map((pt: any) => ({ lat: pt[1], lng: pt[0] }));
                  setTownPolygonsOnMap([path] as any);
                } else if (gj.type === "MultiPolygon") {
                  const pathsList: LatLng[][] = [];
                  gj.coordinates.forEach((poly: any) => {
                    const ring = poly[0] || [];
                    const path: LatLng[] = ring.map((pt: any) => ({ lat: pt[1], lng: pt[0] }));
                    pathsList.push(path);
                  });
                  setTownPolygonsOnMap(pathsList as any);
                }
              }
            }
          }
          const vp = results[0].geometry?.viewport;
          if (vp) {
            setTownBounds(vp);
            if (mapRef.current.map) mapRef.current.map.fitBounds(vp);
            const rectPath = boundsToRectPath(vp);
            if (rectPath.length > 0) setTownPolygonsOnMap([rectPath]);
          }
        } catch {
          const vp = results[0].geometry?.viewport;
          if (vp) {
            setTownBounds(vp);
            if (mapRef.current.map) mapRef.current.map.fitBounds(vp);
            const rectPath = boundsToRectPath(vp);
            if (rectPath.length > 0) setTownPolygonsOnMap([rectPath]);
          }
        }
      }
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google?.maps) {
      setIsMapLoaded(true);
      return;
    }
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyA7sg-dUaG5v6JWizJoU_0E608O2ePDxz0";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (isMapLoaded && window.google && !mapRef.current.map) {
      const mapElement = mapContainerRef.current;
      if (!mapElement) return;
      const initialCenter =
        (townLimit && townLimit.center) ||
        (radiusLimit && radiusLimit.center) ||
        values.find((v) => v.coordinates)?.coordinates ||
        { lat: 38.6431, lng: 34.852 };
      const map = new google.maps.Map(mapElement, {
        center: initialCenter as any,
        zoom: 13,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      });
      mapRef.current.map = map;
      if (townLimit && !readOnly) fetchTownBoundary();
      if (radiusLimit && !readOnly) {
        const circle = new google.maps.Circle({
          strokeColor: "#2563eb",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#3b82f6",
          fillOpacity: 0.15,
          map: map,
          center: radiusLimit.center,
          radius: radiusLimit.radiusKm * 1000,
          clickable: false,
        });
        mapRef.current.radiusCircle = circle;
        const b = circle.getBounds?.();
        if (b) map.fitBounds(b as any);
      }

      // initialize existing markers
      if (Array.isArray(values)) {
        values.forEach((val, idx) => {
          if (val.coordinates) {
            const m = new google.maps.Marker({
              map,
              position: val.coordinates as any,
              draggable: !readOnly,
              animation: google.maps.Animation.DROP,
            });
            if (!readOnly) {
              m.addListener("dragend", (e: google.maps.MapMouseEvent) => {
                if (!e.latLng) return;
                const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                if (townLimit && !isWithinTown(newCoords)) {
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Marker cannot be placed outside the allowed town boundary.`,
                    timer: 1500,
                    showConfirmButton: false,
                  });
                  m.setPosition(val.coordinates as any);
                  return;
                }
                if (radiusLimit && !isWithinRadius(newCoords)) {
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Marker cannot be placed outside the allowed ${radiusLimit.radiusKm}km radius.`,
                    timer: 1500,
                    showConfirmButton: false,
                  });
                  m.setPosition(val.coordinates as any);
                  return;
                }
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: e.latLng }, (results, status) => {
                  if (status === "OK" && results && results[0]) {
                    const comps = results[0].address_components || [];
                    const preferTypes = [
                      "establishment",
                      "point_of_interest",
                      "lodging",
                      "hotel",
                      "premise",
                      "natural_feature",
                      "tourist_attraction",
                      "airport",
                      "transit_station",
                    ];
                    let locName = "";
                    for (const t of preferTypes) {
                      const c = comps.find((x) => Array.isArray(x.types) && x.types.includes(t));
                      if ((c as any)?.long_name) {
                        locName = (c as any).long_name;
                        break;
                      }
                    }
                    if (!locName) {
                      locName = (results[0].formatted_address || "").split(",")[0]?.trim() || "";
                    }
                    const next = [...valuesRef.current];
                    next[idx] = {
                      address: results[0].formatted_address || "",
                      coordinates: newCoords,
                      locationName: locName,
                    };
                    onChange?.(next);
                  }
                });
              });
            }
            mapRef.current.markers.push(m);
          }
        });
      }

      if (!readOnly) {
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          if (valuesRef.current.length >= maxLocations) {
            Swal.fire({
              icon: "info",
              title: "Limit reached",
              text: `You can add up to ${maxLocations} locations`,
              timer: 1200,
              showConfirmButton: false,
            });
            return;
          }
          const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (townLimit && !isWithinTown(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Selected location is outside the allowed town boundary.`,
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }
          if (radiusLimit && !isWithinRadius(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Selected location is outside the allowed ${radiusLimit.radiusKm}km radius.`,
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }

          const marker = new google.maps.Marker({
            map,
            position: e.latLng,
            draggable: true,
            animation: google.maps.Animation.DROP,
          });
          mapRef.current.markers.push(marker);
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: e.latLng }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const comps = results[0].address_components || [];
              const preferTypes = [
                "establishment",
                "point_of_interest",
                "lodging",
                "hotel",
                "premise",
                "natural_feature",
                "tourist_attraction",
                "airport",
                "transit_station",
              ];
              let locName = "";
              for (const t of preferTypes) {
                const c = comps.find((x) => Array.isArray(x.types) && x.types.includes(t));
                if ((c as any)?.long_name) {
                  locName = (c as any).long_name;
                  break;
                }
              }
              if (!locName) {
                locName = (results[0].formatted_address || "").split(",")[0]?.trim() || "";
              }
              const next = [
                ...valuesRef.current,
                {
                  address: results[0].formatted_address || "",
                  coordinates: newCoords,
                  locationName: locName,
                },
              ];
              onChange?.(next);
            }
          });

          marker.addListener("dragend", (ev: google.maps.MapMouseEvent) => {
            if (!ev.latLng) return;
            const coords = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
            if (townLimit && !isWithinTown(coords)) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: `Marker cannot be placed outside the allowed town boundary.`,
                timer: 1500,
                showConfirmButton: false,
              });
              marker.setPosition(new google.maps.LatLng(newCoords.lat, newCoords.lng));
              return;
            }
            if (radiusLimit && !isWithinRadius(coords)) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: `Marker cannot be placed outside the allowed ${radiusLimit.radiusKm}km radius.`,
                timer: 1500,
                showConfirmButton: false,
              });
              marker.setPosition(new google.maps.LatLng(newCoords.lat, newCoords.lng));
              return;
            }
            const geocoder2 = new google.maps.Geocoder();
            geocoder2.geocode({ location: ev.latLng }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const comps = results[0].address_components || [];
                const preferTypes = [
                  "establishment",
                  "point_of_interest",
                  "lodging",
                  "hotel",
                  "premise",
                  "natural_feature",
                  "tourist_attraction",
                  "airport",
                  "transit_station",
                ];
                let locName = "";
                for (const t of preferTypes) {
                  const c = comps.find((x) => Array.isArray(x.types) && x.types.includes(t));
                  if ((c as any)?.long_name) {
                    locName = (c as any).long_name;
                    break;
                  }
                }
                if (!locName) {
                  locName = (results[0].formatted_address || "").split(",")[0]?.trim() || "";
                }
                const idx = mapRef.current.markers.indexOf(marker);
                const next = [...valuesRef.current];
                if (idx >= 0) {
                  next[idx] = {
                    address: results[0].formatted_address || "",
                    coordinates: coords,
                    locationName: locName,
                  };
                  onChange?.(next);
                }
              }
            });
          });
        });
      }

      // autocomplete to add new location
      const input = addressInputRef.current as HTMLInputElement | null;
      if (input) {
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo("bounds", map);
        mapRef.current.autocomplete = autocomplete;
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;
          const newCoords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          if (townLimit && !isWithinTown(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Selected address is outside the allowed town boundary.`,
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }
          if (radiusLimit && !isWithinRadius(newCoords)) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Selected address is outside the allowed ${radiusLimit.radiusKm}km radius.`,
              timer: 1500,
              showConfirmButton: false,
            });
            return;
          }
          const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
            draggable: true,
            animation: google.maps.Animation.DROP,
          });
          mapRef.current.markers.push(marker);
          const extractPlaceName = (): string => {
            const comps = (place as any).address_components || [];
            const preferTypes = [
              "establishment",
              "point_of_interest",
              "lodging",
              "hotel",
              "premise",
              "natural_feature",
              "tourist_attraction",
              "airport",
              "transit_station",
            ];
            for (const t of preferTypes) {
              const c = comps.find((x: any) => Array.isArray(x.types) && x.types.includes(t));
              if (c?.long_name) return c.long_name;
            }
            return (place.formatted_address || "").split(",")[0]?.trim() || "";
          };
          const next = [
            ...valuesRef.current,
            {
              address: place.formatted_address || "",
              coordinates: newCoords,
              locationName: extractPlaceName(),
            },
          ];
          onChange?.(next);
          if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
          else {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
          }
          const placeLocation = place.geometry!.location;
          marker.addListener("dragend", (ev: google.maps.MapMouseEvent) => {
            if (!ev.latLng) return;
            const coords = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
            if (townLimit && !isWithinTown(coords)) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: `Marker cannot be placed outside the allowed town boundary.`,
                timer: 1500,
                showConfirmButton: false,
              });
              marker.setPosition(placeLocation);
              return;
            }
            if (radiusLimit && !isWithinRadius(coords)) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: `Marker cannot be placed outside the allowed ${radiusLimit.radiusKm}km radius.`,
                timer: 1500,
                showConfirmButton: false,
              });
              marker.setPosition(placeLocation);
              return;
            }
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: ev.latLng }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const comps = results[0].address_components || [];
                const preferTypes = [
                  "establishment",
                  "point_of_interest",
                  "lodging",
                  "hotel",
                  "premise",
                  "natural_feature",
                  "tourist_attraction",
                  "airport",
                  "transit_station",
                ];
                let locName = "";
                for (const t of preferTypes) {
                  const c = comps.find((x) => Array.isArray(x.types) && x.types.includes(t));
                  if ((c as any)?.long_name) {
                    locName = (c as any).long_name;
                    break;
                  }
                }
                if (!locName) {
                  locName = (results[0].formatted_address || "").split(",")[0]?.trim() || "";
                }
                const idx = mapRef.current.markers.indexOf(marker);
                const updated = [...valuesRef.current];
                if (idx >= 0) {
                  updated[idx] = {
                    address: results[0].formatted_address || "",
                    coordinates: coords,
                    locationName: locName,
                  };
                  onChange?.(updated);
                }
              }
            });
          });
        });
      }
    }
  }, [isMapLoaded]);

  // update existing markers when values change externally
  useEffect(() => {
    const map = mapRef.current.map;
    if (!map) return;
    // clear markers if counts diverge
    if (mapRef.current.markers.length !== values.length) {
      mapRef.current.markers.forEach((m) => (m as any).setMap(null));
      mapRef.current.markers = [];
      values.forEach((v) => {
        if (v.coordinates) {
          const m = new google.maps.Marker({
            map,
            position: v.coordinates as any,
            draggable: !readOnly,
            animation: google.maps.Animation.DROP,
          });
          if (!readOnly) {
            m.addListener("dragend", (e: google.maps.MapMouseEvent) => {
              if (!e.latLng) return;
              const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
              if (townLimit && !isWithinTown(newCoords)) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: `Marker cannot be placed outside the allowed town boundary.`,
                  timer: 1500,
                  showConfirmButton: false,
                });
                m.setPosition(v.coordinates as any);
                return;
              }
              if (radiusLimit && !isWithinRadius(newCoords)) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: `Marker cannot be placed outside the allowed ${radiusLimit.radiusKm}km radius.`,
                  timer: 1500,
                  showConfirmButton: false,
                });
                m.setPosition(v.coordinates as any);
                return;
              }
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: e.latLng }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                  const comps = results[0].address_components || [];
                  const preferTypes = [
                    "establishment",
                    "point_of_interest",
                    "lodging",
                    "hotel",
                    "premise",
                    "natural_feature",
                    "tourist_attraction",
                    "airport",
                    "transit_station",
                  ];
                  let locName = "";
                  for (const t of preferTypes) {
                    const c = comps.find((x) => Array.isArray(x.types) && x.types.includes(t));
                    if ((c as any)?.long_name) {
                      locName = (c as any).long_name;
                      break;
                    }
                  }
                  if (!locName) {
                    locName = (results[0].formatted_address || "").split(",")[0]?.trim() || "";
                  }
                  const idx = mapRef.current.markers.indexOf(m);
                  const next = [...valuesRef.current];
                  if (idx >= 0) {
                    next[idx] = {
                      address: results[0].formatted_address || "",
                      coordinates: newCoords,
                      locationName: locName,
                    };
                    onChange?.(next);
                  }
                }
              });
            });
          }
          mapRef.current.markers.push(m);
        }
      });
    } else {
      values.forEach((v, i) => {
        const m = mapRef.current.markers[i];
        if (m && v.coordinates) m.setPosition(v.coordinates as any);
      });
    }
    const bounds = new google.maps.LatLngBounds();
    let hadAny = false;
    values.forEach((v) => {
      if (v.coordinates) {
        bounds.extend(new google.maps.LatLng(v.coordinates.lat, v.coordinates.lng));
        hadAny = true;
      }
    });
    if (hadAny) {
      map.fitBounds(bounds as any);
    }
  }, [values, readOnly]);

  const handleRemoveLocation = (index: number) => {
    if (readOnly) return;
    const markers = mapRef.current.markers;
    const m = markers[index];
    if (m) {
      (m as any).setMap(null);
      markers.splice(index, 1);
    }
    const next = values.filter((_, i) => i !== index);
    onChange?.(next);
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // free text entry not strictly needed in multi mode, keep for autocomplete focus
  };

  useEffect(() => {
    if (!mapRef.current.map) return;
    if (readOnly) return;
    if (townLimit) {
      fetchTownBoundary();
    } else {
      clearTownPolygons();
      setTownBounds(null);
      setTownName(null);
    }
    if (radiusLimit) {
      if (mapRef.current.radiusCircle) {
        mapRef.current.radiusCircle.setMap(null);
      }
      const circle = new google.maps.Circle({
        strokeColor: "#2563eb",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        map: mapRef.current.map!,
        center: radiusLimit.center,
        radius: radiusLimit.radiusKm * 1000,
        clickable: false,
      });
      mapRef.current.radiusCircle = circle;
      const b = circle.getBounds?.();
      if (b) mapRef.current.map!.fitBounds(b as any);
      mapRef.current.map!.setCenter(radiusLimit.center);
    } else {
      if (mapRef.current.radiusCircle) {
        mapRef.current.radiusCircle.setMap(null);
        mapRef.current.radiusCircle = null;
      }
    }
  }, [townLimit, radiusLimit, readOnly]);

  return (
    <div className="w-full">
      <div className="space-y-6 w-full">
        {!readOnly && (
          <div className="space-y-1">
            <Label className="text-[14px] font-semibold">
              {label}
              {townLimit && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  {`(Limited to ${townName || "selected town"} boundary)`}
                </span>
              )}
              {!townLimit && radiusLimit && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  (Limited to {radiusLimit.radiusKm}km radius)
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={""}
                onChange={handleAddressInputChange}
                placeholder={placeholder}
                readOnly={false}
                disabled={false}
                className="h-[44px] bg-white w-full pe-10"
                ref={addressInputRef}
              />
            </div>
          </div>
        )}
        <div className={` relative bg-gray-200 overflow-hidden shadow-md ${className}`}>
          {!isMapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : null}
          <div ref={mapContainerRef} className={className}></div>
        </div>
        {!readOnly && values.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold">Selected Locations</Label>
            <div className="space-y-2">
              {values.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium">
                      {loc.locationName || loc.address?.split(",")[0] || `Location ${idx + 1}`}
                    </div>
                    <div className="text-gray-600">{loc.address}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
