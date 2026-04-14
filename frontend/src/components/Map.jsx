import React, { Suspense, lazy } from "react";
import "../styles/Map.css";

const MapboxMap = lazy(() => import("./MapboxMap"));
const tokenFromEnv = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapFallback = ({ loading = false }) => (
  <div className="map-container map-fallback">
    <div className="map-grid" />
    <div className="map-route-line" />
    <div className="map-pin map-pin-start">A</div>
    <div className="map-pin map-pin-end">B</div>
    <div className="map-fallback-panel">
      <p className="map-fallback-kicker">{loading ? "Loading map" : "Mapbox token needed"}</p>
      <h2>{loading ? "Preparing live map" : "Indoor mode is ready"}</h2>
      <p>
        {loading
          ? "Your live navigation surface will appear in a moment."
          : "Set VITE_MAPBOX_TOKEN in the frontend environment to load live maps."}
      </p>
    </div>
  </div>
);

const Map = ({ location, route }) => {
  if (!tokenFromEnv) {
    return <MapFallback />;
  }

  return (
    <Suspense fallback={<MapFallback loading />}>
      <MapboxMap location={location} route={route} token={tokenFromEnv} />
    </Suspense>
  );
};

export default Map;
