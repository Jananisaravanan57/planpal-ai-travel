import React, { useEffect, useState } from 'react'
import { Input } from '../Components/ui/input'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '../constants/option';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { Button } from '../Components/ui/button';
import { toast } from 'sonner';
import { chatSession } from "../service/AIModal";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../Components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../service/firebaseConfig';
import { useNavigate } from 'react-router-dom';

function CreateTrip() {
  const [place, setPlace] = useState();
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, serFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    serFormData({
      ...formData,
      [name]: value
    })
  }

  useEffect(() => {
    console.log(formData);
  }, [formData])

  // Trip data validation function
  const validateTripData = (tripData) => {
    // Check if tripData is an object
    if (typeof tripData !== 'object' || tripData === null) {
      return false;
    }

    // Check for required properties
    const requiredProperties = ['hotels', 'itinerary'];
    for (const prop of requiredProperties) {
      if (!tripData.hasOwnProperty(prop)) {
        console.warn(`Missing required property: ${prop}`);
        // Add default empty array if missing
        tripData[prop] = [];
      }
    }

    // Validate hotels array
    if (!Array.isArray(tripData.hotels)) {
      console.warn('Hotels is not an array, converting...');
      tripData.hotels = [];
    }

    // Handle itinerary structure - convert day1, day2 format to array format
    if (tripData.itinerary && typeof tripData.itinerary === 'object' && !Array.isArray(tripData.itinerary)) {
      console.warn('Converting itinerary from object format to array format...');
      const itineraryArray = [];
      
      // Look for day1, day2, etc. properties
      Object.keys(tripData.itinerary).forEach(key => {
        if (key.startsWith('day')) {
          const dayNumber = parseInt(key.replace('day', ''));
          const dayData = tripData.itinerary[key];
          
          itineraryArray.push({
            day: dayNumber,
            theme: dayData.theme || `Day ${dayNumber}`,
            plan: dayData.plan || []
          });
        }
      });
      
      // Sort by day number
      itineraryArray.sort((a, b) => a.day - b.day);
      tripData.itinerary = itineraryArray;
    }

    // Validate itinerary array
    if (!Array.isArray(tripData.itinerary)) {
      console.warn('Itinerary is not an array, converting...');
      tripData.itinerary = [];
    }

    return true;
  };

  // Solution 1: Use implicit flow instead of auth-code flow
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => GetUserProfile(tokenResponse),
    onError: (error) => console.log(error),
    // Remove flow: 'auth-code' to use implicit flow by default
  })

  // Solution 2: Alternative using auth-code flow with proper error handling
  const loginWithAuthCode = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResp) => {
      try {
        // You'll need to exchange the authorization code for tokens on your backend
        // This is just an example - implement your backend endpoint
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: codeResp.code }),
        });

        const data = await response.json();
        if (data.access_token) {
          await GetUserProfile(data.access_token);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast.error("Authentication failed. Please try again.");
      }
    },
    onError: (error) => {
      console.log('Login error:', error);
      toast.error("Login failed. Please try again.");
    }
  })

  const OnGenerateTrip = async () => {
    const user = localStorage.getItem('user');

    if (!user) {
      setOpenDialog(true);
      return;
    }
    if (!formData?.location || !formData?.budget || !formData?.traveler || formData?.noOfDays > 5) {
      toast("Please fill all details correctly");
      return;
    }
    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT
      .replace("{location}", formData.location.label)
      .replace("{totalDays}", formData.noOfDays)
      .replace("{traveler}", formData.traveler)
      .replace("{budget}", formData.budget);

    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const responseText = await result.response.text();
      console.log("AI Trip Plan:", responseText);
      setLoading(false);
      SavedAiTrip(responseText);

      // Store the generated trip and close dialog
      localStorage.setItem('generatedTrip', responseText);
      setOpenDialog(false);
      toast.success("Trip generated successfully!");

    } catch (e) {
      console.error(e);
      toast.error("Error generating trip. Please try again.");
      setLoading(false);
    }
  };

  // Improved SavedAiTrip function with robust JSON parsing
  const SavedAiTrip = async (TripData) => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const docId = Date.now().toString();

    // Clean AI response (remove ```json and ``` wrappers)
    let cleanedTripData = TripData
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedTrip;
    
    try {
      // First attempt - direct parsing
      parsedTrip = JSON.parse(cleanedTripData);
    } catch (firstError) {
      console.log("First parsing attempt failed, trying to extract JSON from text...");
      
      try {
        // Second attempt - extract JSON from mixed text/JSON response
        // Look for JSON starting with { and ending with }
        const jsonMatch = cleanedTripData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedTripData = jsonMatch[0];
          parsedTrip = JSON.parse(cleanedTripData);
        } else {
          throw new Error("No JSON object found in response");
        }
      } catch (secondError) {
        console.log("Second parsing attempt failed, trying to fix JSON format...");
        
        try {
          // Third attempt - fix common JSON issues
          cleanedTripData = cleanedTripData
            // Replace single quotes with double quotes (but not within strings)
            .replace(/'/g, '"')
            // Fix unquoted property names
            .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
            // Fix trailing commas
            .replace(/,(\s*[}\]])/g, '$1')
            // Fix quotes around property values that contain quotes
            .replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1$2$3"');
          
          parsedTrip = JSON.parse(cleanedTripData);
        } catch (thirdError) {
          console.log("Third parsing attempt failed, trying more aggressive fixes...");
          
          try {
            // Fourth attempt - more aggressive cleaning
            cleanedTripData = cleanedTripData
              // Remove any non-printable characters
              .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
              // Ensure proper quote escaping
              .replace(/\\"/g, '\\"')
              // Fix any remaining single quotes in property names
              .replace(/(['"])?([a-zA-Z_$][a-zA-Z0-9_$]*)\1?\s*:/g, '"$2":')
              // Remove duplicate commas
              .replace(/,+/g, ',')
              // Remove leading/trailing commas
              .replace(/,(\s*[}\]])/g, '$1')
              .replace(/([{\[]\s*),/g, '$1');
            
            parsedTrip = JSON.parse(cleanedTripData);
          } catch (fourthError) {
            // If all parsing attempts fail, log the cleaned data for debugging
            console.error("All JSON parsing attempts failed:");
            console.error("Original error:", firstError);
            console.error("Cleaned data:", cleanedTripData.substring(0, 500) + "...");
            console.error("Final error:", fourthError);
            
            // Create a fallback trip object
            parsedTrip = {
              error: true,
              message: "Failed to parse AI response",
              rawData: TripData,
              hotels: [],
              itinerary: []
            };
            
            toast.error("Trip data couldn't be parsed properly. Saving raw data for manual review.");
          }
        }
      }
    }

    // Validate the parsed trip data
    if (parsedTrip && !parsedTrip.error) {
      validateTripData(parsedTrip);
    }

    try {
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: parsedTrip,
        userEmail: user?.email,
        id: docId,
        createdAt: new Date().toISOString()
      });
      
      if (!parsedTrip.error) {
        toast.success("Trip saved successfully!");
      }
    } catch (firebaseError) {
      console.error("Error saving to Firebase:", firebaseError);
      toast.error("Failed to save trip. Please try again.");
    }
    
    setLoading(false);
    navigate('/view-trip/'+docId);
  };

  // Updated GetUserProfile function
  const GetUserProfile = async (tokenResponse) => {
    try {
      // For implicit flow, use tokenResponse.access_token
      // For auth-code flow, the token would come from your backend
      const accessToken = tokenResponse.access_token || tokenResponse;

      const res = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          }
        }
      );

      console.log('User profile:', res.data);

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(res.data));

      // Close the dialog
      setOpenDialog(false);

      // Show success message
      toast.success(`Welcome ${res.data.name}!`);
      OnGenerateTrip();

      return res.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error("Failed to get user profile. Please try again.");
    }
  };

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10'>
      <h2 className='font-bold text-3xl'>Tell us your travel preferences🏕️🏝️❤️</h2>
      <p className='mt-3 text-gray-500 text-xl'>
        Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
      </p>

      <div className='mt-20 flex flex-col gap-9' >
        <div>
          <h2 className='text-xl my-3 font-medium'>What is your destination of choice?</h2>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              value: place,
              onChange: (v) => {
                setPlace(v);
                handleInputChange('location', v)
              },
            }}
          />
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>
            How many days are you planning your trip?
          </h2>
          <Input placeholder={'Ex.3'} type='number'
            onChange={(e) => handleInputChange('noOfDays', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h2 className='text-xl my-3 font-medium'>What is Your Budget?</h2>
        <div className='grid grid-cols-3 gap-5 mt-5'>
          {SelectBudgetOptions.map((item, index) => (
            <div key={index}
              onClick={() => handleInputChange('budget', item.title)}
              className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg
            ${formData?.budget == item.title && 'shadow-lg border-black'} `}>
              <h2 className='text-4xl'>{item.icon}</h2>
              <h2 className='font-bold text-lg'>{item.title}</h2>
              <h2 className='text-sm text-gray-500'>{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className='text-xl my-3 font-medium'>Who do you plan on travelling with on your next adventure?</h2>
        <div className='grid grid-cols-3 gap-5 mt-5'>
          {SelectTravelesList.map((item, index) => (
            <div key={index}
              onClick={() => handleInputChange('traveler', item.people)}
              className={`p-4 border cursor-pointer rounded-lg hover:shadow-2xl
              ${formData?.traveler == item.people && 'shadow-lg border-black'}
             `}>
              <h2 className='text-4xl'>{item.icon}</h2>
              <h2 className='font-bold text-lg'>{item.title}</h2>
              <h2 className='text-sm text-gray-500'>{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>

      <div className='my-10 justify-end flex'>
        <Button disabled={loading}
          onClick={OnGenerateTrip}>
          {loading ?
            <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' />:

            <>
              Generate Trip
            </>}
        </Button>
      </div>

       <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogContent className="bg-gray-100 p-6 rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Sign In</DialogTitle>
                  <DialogDescription>
                    Sign in securely using your Google account.
                  </DialogDescription>
                </DialogHeader>
      
                <div className="flex flex-col items-center text-center">
                  <img src="/logo.jpg" alt="Logo" className="w-20 h-20  mb-8" />
                  <h2 className="font-bold text-lg mt-4">Sign In with Google</h2>
                  <p className="text-sm text-gray-600">
                    Sign in to the app with Google authentication securely
                  </p>
      
                  <Button
                    onClick={login}
                    className="w-full mt-5 flex gap-3 items-center justify-center 
                   bg-white hover:bg-gray-100 text-black font-medium border border-gray-300 py-2 rounded-lg"
                    variant={null}
                  >
                    <FcGoogle className="h-6 w-6" />
                    Sign in with Google
                  </Button>
      
      
                </div>
              </DialogContent>
            </Dialog>
      
    </div>
  )
}

export default CreateTrip