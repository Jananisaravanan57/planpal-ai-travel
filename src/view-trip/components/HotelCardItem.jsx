import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPhotoUrl, GetPlaceDetails } from '../../service/GlobeApi';
import placeholder from '../../assets/placeholder.jpg'

function HotelCardItem({hotel }) {

      const [photoUrl, setPhotoUrl] = useState();
    
      useEffect(() => {
        hotel && GetPlacephoto();
      }, [hotel])
    
      const GetPlacephoto = async () => {
        try {
          const data = {
            textQuery: hotel?.hotelName
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
   <Link
            to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel?.hotelName + ","+hotel?.hotelAddress)}`}  
            target='_blank'
          >
            <div className='hover:scale-105 transition-all cursor-pointer'>
              <img src={photoUrl?photoUrl:{placeholder}} alt="Hotel" className='mt-5 rounded-2xl object-cover' />
              <div className='my-2 flex flex-col gap-2'>
                <h2 className='font-medium'>{hotel?.hotelName}</h2>
                <h2 className='text-xs text-gray-500'>📍 {hotel?.hotelAddress}</h2>
                <h2 className='text-sm text-gray-500'>💰 {hotel?.priceRange}</h2>
                <h2 className='text-xs text-gray-500'>⭐ {hotel?.rating}</h2>
              </div>
            </div>
          </Link>
  )
}

export default HotelCardItem