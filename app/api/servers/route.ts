import { NextResponse } from 'next/server';

interface SpeedtestServer {
  id: number;
  sponsor: string;
  name: string;
  host: string;
  url: string;
  lat: number;
  lon: number;
  country: string;
  cc: string;
}

// Hardcoded fallback servers in Indonesia (reliable targets for demo)
// Note: These are representative URLs. In a real app, we'd use official Ookla/proprietary endpoints.
// For this web-based demo, we might need to use a generic download test file if these specific endpoints don't support CORS.
const FALLBACK_SERVERS: SpeedtestServer[] = [
  {
    id: 1,
    sponsor: "Biznet Networks",
    name: "Jakarta",
    host: "jakarta.speedtest.biznetnetworks.com:8080",
    url: "http://jakarta.speedtest.biznetnetworks.com:8080/speedtest/upload.php",
    lat: -6.1751,
    lon: 106.8650,
    country: "Indonesia",
    cc: "ID"
  },
  {
    id: 2,
    sponsor: "Telkom Indonesia",
    name: "Jakarta",
    host: "speedtest.telkom.co.id:8080",
    url: "http://speedtest.telkom.co.id:8080/speedtest/upload.php",
    lat: -6.1751,
    lon: 106.8650,
    country: "Indonesia",
    cc: "ID"
  },
  {
    id: 3,
    sponsor: "First Media",
    name: "Jakarta",
    host: "speedtest.firstmedia.com:8080",
    url: "http://speedtest.firstmedia.com:8080/speedtest/upload.php",
    lat: -6.1751,
    lon: 106.8650,
    country: "Indonesia",
    cc: "ID"
  },
  {
    id: 4,
    sponsor: "Indosat Ooredoo",
    name: "Surabaya",
    host: "speedtest.indosatooredoo.com:8080",
    url: "http://speedtest.indosatooredoo.com:8080/speedtest/upload.php",
    lat: -7.2575,
    lon: 112.7521,
    country: "Indonesia",
    cc: "ID"
  }
];

export async function GET() {
  try {
    // Attempt to fetch from a public list (often contains thousands of servers)
    // Using a search query or just filtering locally would be ideal.
    // Many public JSONs are huge. For now, we return the fallback to ensure reliability 
    // and because public lists often change URL structures.
    
    // In a full production app, we would fetch:
    // const res = await fetch('https://raw.githubusercontent.com/iptv-org/iptv/master/streams/id.m3u'); // Example, not real
    
    // Removed artificial delay for accurate ping measurement
    
    return NextResponse.json(FALLBACK_SERVERS);
  } catch (error) {
    console.error('Failed to fetch servers:', error);
    return NextResponse.json(FALLBACK_SERVERS);
  }
}
