import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapboxMap = ({ location, route, token }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [location?.lng || -74.5, location?.lat || 40],
      zoom: location ? 18 : 12,
    });
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      marker.current?.remove();
      map.current?.remove();
      marker.current = null;
      map.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!map.current || !location) return;

    const lngLat = [location.lng, location.lat];
    map.current.flyTo({ center: lngLat, zoom: 18, essential: true });

    if (!marker.current) {
      marker.current = new mapboxgl.Marker({ color: "#0f766e" }).setLngLat(lngLat).addTo(map.current);
    } else {
      marker.current.setLngLat(lngLat);
    }
  }, [location]);

  useEffect(() => {
    if (!map.current || !route?.directions) return;

    const coordinates = route.directions
      .map((direction) =>
        Number.isFinite(direction.lng) && Number.isFinite(direction.lat)
          ? [direction.lng, direction.lat]
          : null,
      )
      .filter(Boolean);

    if (coordinates.length < 2) return;

    const data = {
      type: "Feature",
      geometry: { type: "LineString", coordinates },
    };

    const upsertRoute = () => {
      const source = map.current.getSource("route");
      if (source) {
        source.setData(data);
        return;
      }

      map.current.addSource("route", { type: "geojson", data });
      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#0f766e", "line-width": 5 },
      });
    };

    if (map.current.loaded()) {
      upsertRoute();
    } else {
      map.current.once("load", upsertRoute);
    }
  }, [route]);

  return <div ref={mapContainer} className="map-container" />;
};

export default MapboxMap;
