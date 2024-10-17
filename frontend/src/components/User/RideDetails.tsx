import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Ride {
  id: number;
  status: 'REQUESTED' | 'ACCEPTED' | 'COMPLETED';
  destination_location: string;
  pickup_location: string;
  scheduled_time: string;
  pin?: number;
  offer?: {
    id: number;
    driver_id: number;
    price: number;
  };
}

const RideDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const rideId = Number(id);

  const { data: ride, isLoading, isError } = useQuery<Ride>({
    queryKey: ['ride', rideId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:3001/api/v1/ride/${rideId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    },
  });

  const handleReview = (rideId: number) => {
    console.log(`Review ride ${rideId}`);
    // Implement logic to leave a review
  };

  if (isLoading) {
    return <Text>Loading ride details...</Text>;
  }

  if (isError || !ride) {
    return <Text>Error loading ride details</Text>;
  }

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg">
          Ride Details
        </Heading>
        <Text><strong>From:</strong> {ride.pickup_location}</Text>
        <Text><strong>To:</strong> {ride.destination_location}</Text>
        <Text><strong>Date:</strong> {new Date(ride.scheduled_time).toLocaleString()}</Text>
        <Text><strong>Status:</strong> {ride.status}</Text>
        {ride.status === 'ACCEPTED' && (
          <>
            <Text fontWeight="bold" fontSize="2xl">PIN: {ride.pin}</Text>
            <Text>Waiting for driver to validate PIN...</Text>
          </>
        )}
        {ride.status === 'COMPLETED' && (
          <>
            <Text>The ride has been completed.</Text>
            <Button colorScheme="purple" onClick={() => handleReview(ride.id)}>
              Review
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default RideDetails;