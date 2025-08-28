import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'; // Changed from useNavigation to useNavigate
import { db } from '../service/firebaseConfig';

function MyTrips() {
  const navigate = useNavigate(); // Changed from navigation to navigate
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetUserTrips();
  }, [])

  const GetUserTrips = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        navigate('/'); // Changed from navigation('/') to navigate('/')
        return;
      }

      // Fixed the field name from 'useEmail' to 'userEmail'
      const q = query(collection(db, 'AITrips'), where('userEmail', '==', user?.email));
      const querySnapshot = await getDocs(q);
      
      const trips = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        trips.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setUserTrips(trips);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user trips:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading your trips...</div>;
  }

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">My Trips</h2>
      
      {userTrips.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-700 mb-4 text-lg">No trips found. Create your first trip!</p>
          <button 
            onClick={() => navigate('/create-trip')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Create Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTrips.map((trip) => (
            <div key={trip.id} className="border-2 border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow bg-white">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {trip.userSelection?.location?.label || 'Unknown Destination'}
              </h3>
              <div className="text-sm text-gray-800 space-y-2 font-medium">
                <p className="flex items-center gap-2">
                  <span className="text-blue-600">📅</span> 
                  <span className="text-gray-700">{trip.userSelection?.noOfDays} Days</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600">💰</span> 
                  <span className="text-gray-700">{trip.userSelection?.budget} Budget</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-purple-600">👥</span> 
                  <span className="text-gray-700">{trip.userSelection?.traveler} Travelers</span>
                </p>
                {trip.createdAt && (
                  <p className="flex items-center gap-2">
                    <span className="text-orange-600">📝</span> 
                    <span className="text-gray-700">Created: {new Date(trip.createdAt).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
              <button 
                onClick={() => navigate(`/view-trip/${trip.id}`)}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
              >
                View Trip Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTrips