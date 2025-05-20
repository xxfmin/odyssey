"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

// smoothly zoom the map up to `targetZoom` by stepping +1 every 80ms
function smoothZoom(map: google.maps.Map, targetZoom: number) {
  const currentZoom = map.getZoom()!;
  if (currentZoom >= targetZoom) return;
  const listener = map.addListener("zoom_changed", () => {
    google.maps.event.removeListener(listener);
    smoothZoom(map, targetZoom);
  });
  setTimeout(() => map.setZoom(currentZoom + 1), 80);
}

export interface ActivityMarker {
  _id: string;
  title: string;
  location: { lat: number; lng: number };
}

interface MapProps {
  lat: number;
  lng: number;
  activities: ActivityMarker[];
}

export function Map({ lat, lng, activities }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 1) initialize map once
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_MAPS_KEY as string,
        version: "weekly",
      });
      const { Map } = await loader.importLibrary("maps");
      const map = new Map(containerRef.current!, {
        center: { lat, lng },
        zoom: 11,
        mapId: "MY_NEXTJS_MAPID",
      });
      mapRef.current = map;
      setMapLoaded(true);
    };
    initMap();
  }, []);

  // 2) pan & smooth-zoom when `lat`/`lng` change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.panTo({ lat, lng });
    smoothZoom(map, 14);
  }, [lat, lng]);

  // 3) once map is ready, clear old markers/InfoWindows and add new ones
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current!;

    // clear any existing markers and info windows
    markersRef.current.forEach((m) => m.setMap(null));
    infoWindowsRef.current.forEach((iw) => iw.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    activities.forEach((act, idx) => {
      // create marker with numeric label
      const marker = new google.maps.Marker({
        position: act.location,
        map,
        label: {
          text: `${idx + 1}`,
          color: "#FFFFFF",
          fontSize: "14px",
          fontWeight: "bold",
        },
      });

      // create an InfoWindow for hover
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-size:12px; font-weight:bold;">${act.title}</div>`,
        pixelOffset: new google.maps.Size(0, -30),
      });

      // show InfoWindow on mouseover
      marker.addListener("mouseover", () => {
        infoWindow.open({ anchor: marker, map });
      });
      // hide on mouseout
      marker.addListener("mouseout", () => {
        infoWindow.close();
      });

      // click to pan & zoom
      marker.addListener("gmp-click", () => {
        map.panTo(marker.getPosition()!);
        smoothZoom(map, 14);
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });
  }, [mapLoaded, activities]);

  return <div ref={containerRef} className="h-full w-full" />;
}
