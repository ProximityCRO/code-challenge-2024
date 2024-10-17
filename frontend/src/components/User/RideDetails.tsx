import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  const location = useLocation();

  const navigate = useNavigate();
  
  const queryClient = useQueryClient();
  let ride = location.state?.ride as Ride | undefined;

  if (!ride) {
    const rides = queryClient.getQueryData<Ride[]>(['userRides']);
    ride = rides?.find((ride) => ride.id === rideId);
  }
  
  if (!ride) {
    useEffect(() => {
      navigate('/user-dashboard');
    }, [navigate]);
    return <Text>Ride not found</Text>;
  }

  const handleReview = (rideId: number) => {
    console.log(`Review ride ${rideId}`);
    // Implement logic to leave a review
  };

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
        {ride.status.toUpperCase() === 'ACCEPTED' && (
          <>
            <Text fontWeight="bold" fontSize="2xl">PIN: {ride.pin}</Text>
            <Text>Waiting for driver to validate PIN...</Text>
          </>
        )}
        {ride.status.toUpperCase() === 'COMPLETED' && (
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