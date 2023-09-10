// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Text, Spinner } from '@chakra-ui/react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';

const DistanceCalculator = () => {
  const [city1, setCity1] = useState('');
  const [city2, setCity2] = useState('');
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (city1 && city2) {
      // Geocode the cities to get their coordinates
      const geocoder = new window.google.maps.Geocoder();
      geocodeCity(geocoder, city1, 0);
      geocodeCity(geocoder, city2, 1);
    }
  }, [city1, city2]);

  const geocodeCity = (geocoder, city, index) => {
    geocoder.geocode({ address: city }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const newMarkers = [...markers];
        newMarkers[index] = location;
        setMarkers(newMarkers);
        if (index === 1) {
          // Set the map center between the two cities
          setMapCenter({
            lat: (newMarkers[0].lat() + newMarkers[1].lat()) / 2,
            lng: (newMarkers[0].lng() + newMarkers[1].lng()) / 2,
          });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const bingMapsApiKey = 'At0f7dw9H62jf_IFEb15zjn0RSIiUJK6uKGX_68gjYEKw4MY8iRexyajfJD99BMc';
    const url = `https://dev.virtualearth.net/REST/v1/Routes/Driving?wp.0=${city1}&wp.1=${city2}&key=${bingMapsApiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.resourceSets[0].resources.length > 0) {
        const distance = data.resourceSets[0].resources[0].travelDistance;
        setDistance(distance);
        setError(null);
      } else {
        setDistance(null);
        setError('Unable to calculate distance.');
      }
    } catch (error) {
      setDistance(null);
      setError('Error fetching distance data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" my="8">
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Enter City 1"
          value={city1}
          onChange={(e) => setCity1(e.target.value)}
          mb="4"
          colorScheme="whiteAlpha"
        />
        <Input
          type="text"
          placeholder="Enter City 2"
          value={city2}
          onChange={(e) => setCity2(e.target.value)}
          mb="4"
          colorScheme="whiteAlpha"
        />
        <Button type="submit" colorScheme="blue" mb="4" isLoading={isLoading}>
          {isLoading ? <Spinner /> : 'Calculate Distance'}
        </Button>
      </form>
      {distance && <Text>Distance between {city1} and {city2}: {distance} km</Text>}
      {error && <Text color="red">{error}</Text>}
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          center={mapCenter}
          zoom={6}
          mapContainerStyle={{ height: '400px', width: '100%' }}
        >
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={marker}
              label={index === 0 ? 'City 1' : 'City 2'}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

export default DistanceCalculator;
