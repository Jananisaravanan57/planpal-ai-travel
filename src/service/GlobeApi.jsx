import axios from "axios"

const BASE_URL = 'https://places.googleapis.com/v1/places:searchText'

export const GetPlaceDetails = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
      'X-Goog-FieldMask': 'places.photos,places.displayName,places.id'
    }
  }

  try {
    const response = await axios.post(BASE_URL, data, config);
    return response;
  } catch (error) {
    console.error('Places API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Function to construct photo URL
export const getPhotoUrl = (photoName) => {
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=2048&maxWidthPx=1080&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;
}