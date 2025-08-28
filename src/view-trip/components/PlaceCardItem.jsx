import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPhotoUrl, GetPlaceDetails } from '../../service/GlobeApi';
import placeholder from '../../assets/placeholder.jpg'
function PlaceCardItem({place}) {
   const [photoUrl, setPhotoUrl] = useState();
    
      useEffect(() => {
        place && GetPlacephoto();
      }, [place])
    
      const GetPlacephoto = async () => {
        try {
          const data = {
            textQuery: place?.placeName
          }
          
          console.log('Searching for:', data.textQuery);
          const result = await GetPlaceDetails(data);
          console.log('API Response:', result.data);
          
          // Extract photo URL if available
          if (result.data?.places && result.data.places.length > 0) {
            const place = result.data.places[0];
            if (place.photos && place.photos.length > 0) {
              // Use the first photo (index 0) instead of index 2
              const photoName = place.photos[0].name;
              // Construct photo URL using the helper function
              const constructedPhotoUrl = getPhotoUrl(photoName);
              setPhotoUrl(constructedPhotoUrl);
              console.log('Photo URL:', constructedPhotoUrl);
            } else {
              console.log('No photos available for this place');
            }
          } else {
            console.log('No places found in response');
          }
        } catch (error) {
          console.error('Error fetching place photo:', error);
          setPhotoUrl(photoUrl);
        }
      }

  return (
    <Link to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place?.placeName)}`}  target='_blank'>
    <div className='border rounded-xl p-3 mt-2 flex  gap-5 hover:scale-105 transition-all hover:shadow-md cursor-pointer'>
        <img src = {photoUrl? photoUrl:{placeholder}} className='w-[130px] h-[130px] rounded-xl object-cover'/>
        <div>
            <h2 className='font-bold text-lg'>{place?.placeName}</h2>
            <p className='text-sm text-gray-400'>{place?.placeDetails}</p>
            <h2 className='mt-2'> 🕛 {place?.time}</h2>
            {/* <Button><FaMapLocationDot /></Button> */}

        </div>
    </div>
    </Link>
  )
}

export default PlaceCardItem