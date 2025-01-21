// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const router = useRouter();

  useEffect(() => {
    // Load Google Places API
    const loadGoogleMapsScript = () => {
      if (typeof window === 'undefined' || window.google) return;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDJ4WcNNqmQU96YIRrHn_L1vEPd2QTu2w0&libraries=places`;
      script.async = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    };

    const initializeAutocomplete = () => {
      const fromInput = document.getElementById('from-input');
      const toInput = document.getElementById('to-input');

      if (fromInput) {
        const fromAutocomplete = new google.maps.places.Autocomplete(fromInput);
        fromAutocomplete.addListener('place_changed', () => {
          const place = fromAutocomplete.getPlace();
          setFrom(place.formatted_address || fromInput.value);
        });
      }

      if (toInput) {
        const toAutocomplete = new google.maps.places.Autocomplete(toInput);
        toAutocomplete.addListener('place_changed', () => {
          const place = toAutocomplete.getPlace();
          setTo(place.formatted_address || toInput.value);
        });
      }
    };

    loadGoogleMapsScript();
  }, []);

  const handleSearch = () => {
    router.push(`/map?from=${from}&to=${to}`);
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen p-4 bg-blue-50">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Hitchiked!</h1>
      <div className="w-full max-w-sm">
        <label className="block mb-2">Leaving from:</label>
        <input
          id="from-input"
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="Enter starting point"
        />
        <label className="block mb-2">Going to:</label>
        <input
          id="to-input"
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          placeholder="Enter destination"
        />
        <label className="block mb-2">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <label className="block mb-2">Passengers:</label>
        <input
          type="number"
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value))}
          min="1"
          className="w-full p-2 mb-6 border border-gray-300 rounded"
        />
        <button
          onClick={handleSearch}
          className="w-full p-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </main>
  );
}
