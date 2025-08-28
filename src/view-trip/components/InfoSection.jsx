import React, { useEffect, useState } from 'react'
import placeholder from "../../assets/placeholder.jpg";
import { Button } from '../../Components/ui/button';
import { GrSend } from "react-icons/gr";
import { GetPlaceDetails, getPhotoUrl } from '../../service/GlobeApi';


function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState(placeholder);

  useEffect(() => {
    trip && GetPlacephoto();
  }, [trip])

  const GetPlacephoto = async () => {
    try {
      const data = {
        textQuery: trip?.userSelection?.location?.label
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
      // Keep using placeholder image on error
      setPhotoUrl(photoUrl);
    }
  }

  return (
    <div>
      <img 
        src={photoUrl?photoUrl:{placeholder}} 
        className='h-[540px] w-full object-cover rounded-xl' 
        alt={trip?.userSelection?.location?.label || 'Trip destination'}
        onError={(e) => {
          console.log('Image failed to load, using placeholder');
          setPhotoUrl(placeholder);
        }}
      />
      <div className='flex justify-between items-center'>
        <div className='my-5 flex flex-col gap-2'>
          <h2 className='font-bold text-2xl'>
            {trip?.userSelection?.location?.label}
          </h2>
          <div className='flex gap-5'>
            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md'>
              📆 {trip?.userSelection?.noOfDays} Day
            </h2>
            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md'>
              💸 {trip?.userSelection?.budget} Budget
            </h2>
            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md'>
              🥂 No.of.Traveler: {trip?.userSelection?.traveler}
            </h2>
          </div>
        </div>
        <Button><GrSend /></Button>
      </div>
    </div>
  )
}

export default InfoSection