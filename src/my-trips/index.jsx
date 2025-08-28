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
    <div className="p-10" style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <h2 
        className="text-3xl font-bold mb-6" 
        style={{ color: '#000000', fontSize: '2rem', fontWeight: 'bold' }}
      >
        My Trips
      </h2>
      
      {userTrips.length === 0 ? (
        <div className="text-center">
          <p 
            className="mb-4 text-lg" 
            style={{ color: '#333333', fontSize: '1.125rem' }}
          >
            No trips found. Create your first trip!
          </p>
          <button 
            onClick={() => navigate('/create-trip')}
            className="px-6 py-2 rounded-lg"
            style={{ 
              backgroundColor: '#2563eb', 
              color: '#ffffff', 
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Create Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTrips.map((trip) => (
            <div 
              key={trip.id} 
              className="rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              style={{ 
                border: '2px solid #d1d5db', 
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: '#000000', fontSize: '1.25rem', fontWeight: 'bold' }}
              >
                {trip.userSelection?.location?.label || 'Unknown Destination'}
              </h3>
              <div className="space-y-2" style={{ fontSize: '0.875rem' }}>
                <p style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📅</span> 
                  <span style={{ fontWeight: '500' }}>{trip.userSelection?.noOfDays} Days</span>
                </p>
                <p style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💰</span> 
                  <span style={{ fontWeight: '500' }}>{trip.userSelection?.budget} Budget</span>
                </p>
                <p style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👥</span> 
                  <span style={{ fontWeight: '500' }}>{trip.userSelection?.traveler} Travelers</span>
                </p>
                {trip.createdAt && (
                  <p style={{ color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📝</span> 
                    <span style={{ fontWeight: '500' }}>
                      Created: {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
              <button 
                onClick={() => navigate(`/view-trip/${trip.id}`)}
                className="mt-6 w-full py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  width: '100%'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1e40af'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#1d4ed8'}
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