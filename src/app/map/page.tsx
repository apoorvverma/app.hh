// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MapContent() {
    const searchParams = useSearchParams();
    const from = searchParams.get('from');
    const to = searchParams.get('to');
  
    return (
      <div className="h-screen">
        <h1 className="text-center text-lg font-bold p-4">Directions from {from} to {to}</h1>
        <iframe
          width="100%"
          height="90%"
          frameBorder="0"
          src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyDJ4WcNNqmQU96YIRrHn_L1vEPd2QTu2w0&origin=${encodeURIComponent(
            from || ''
          )}&destination=${encodeURIComponent(to || '')}&mode=driving`}
          allowFullScreen
        ></iframe>
      </div>
    );
  }

export default function MapPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <MapContent />
      </Suspense>
    );
  }