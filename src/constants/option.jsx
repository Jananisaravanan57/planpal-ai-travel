import { User, Heart, Users, Group, Wallet, Scale, Crown } from "lucide-react";

export const SelectTravelesList = [
  {
    id: 1,
    title: "Just Me",
    desc: "A solo traveler in exploration",
    icon: '👩🏼‍🦰',
    people: "1",
  },
  {
    id: 2,
    title: "Couple",
    desc: "Two travelers in tandem",
    icon: '👩‍❤️‍👨',
    people: "2 People",
  },
  {
    id: 3,
    title: "Family",
    desc: "A group of fun loving adventurers",
    icon: '👨‍👩‍👧‍👧',
    people: "3 to 5 People",
  },
  {
    id: 4,
    title: "Friends",
    desc: "A bunch of thrill-seekers",
    icon:  '⛺',
    people: "5 to 10 People",
  },
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Affordable",
    desc: "Stay conscious of costs",
    icon:'👛',
  },
  {
    id: 2,
    title: "Moderate",
    desc: "Keep cost on the average side",
    icon: '⚖️',
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Don't worry about cost",
    icon: '👑',
  },
];

export const AI_PROMPT = `Generate a travel plan for Location: {location}, for {totalDays} Days for {traveler} with a {budget} budget. 

CRITICAL: Respond ONLY with valid JSON. Do not include any explanatory text, disclaimers, or additional content before or after the JSON.

Return this exact structure:
{
  "hotels": [
    {
      "hotelName": "Hotel Name",
      "hotelAddress": "Hotel Address", 
      "priceRange": "Price Range",
      "hotelImageURL": "placeholder-image-url",
      "geoCoordinates": {"lat": 0, "lng": 0},
      "rating": "Rating",
      "description": "Description"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "Day Theme",
      "plan": [
        {
          "placeName": "Place Name",
          "placeDetails": "Details",
          "placeImageURL": "placeholder-image-url", 
          "geoCoordinates": {"lat": 0, "lng": 0},
          "ticketPricing": "Price",
          "time": "Time"
        }
      ]
    }
  ]
}`;