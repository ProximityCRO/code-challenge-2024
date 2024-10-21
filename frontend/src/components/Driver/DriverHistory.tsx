import React from 'react';
import { Box, VStack, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Ride {
  id: number;
  status: string;
  pickup_location: string;
  destination_location: string;
  scheduled_time: string;
  offer?: {
    price: number;
  };
  review?: {
    rating: number;
    comments: string;
  };
}

const DriverHistory: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { data: rides, isLoading, isError } = useQuery<Ride[]>({
    queryKey: ["driverRides"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:3001/api/v1/ride", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    },
  });

  const completedRides = rides?.filter(ride => ride.status.toUpperCase() === 'COMPLETED');

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <Heading as="h1" size="xl" mb={8}>
        Ride History
      </Heading>
      {isLoading ? (
        <Text>Loading ride history...</Text>
      ) : isError ? (
        <Text>Error loading ride history</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {completedRides?.map(ride => (
            <Box
              key={ride.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              borderColor={borderColor}
              bg={bgColor}
            >
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">
                  Ride #{ride.id.toString().padStart(4, '0')}
                </Text>
                <Text>From: {ride.pickup_location}</Text>
                <Text>To: {ride.destination_location}</Text>
                <Text>Date: {new Date(ride.scheduled_time).toLocaleString()}</Text>
                <Text>Price: ${ride.offer?.price.toFixed(2)}</Text>
                {ride.review && (
                  <>
                    <Text>Review Rating: {ride.review.rating} / 5</Text>
                    <Text>Comments: {ride.review.comments}</Text>
                  </>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default DriverHistory;
