export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [parseFloat(lat), parseFloat(lon)];
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  return null;
}