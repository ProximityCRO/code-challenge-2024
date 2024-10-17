import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  useToast,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface RideRequest {
  pickup_location: string;
  destination_location: string;
  scheduled_time: string;
}

const NewRideRequest: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const createRideMutation = useMutation({
    mutationFn: async (newRide: RideRequest) => {
      const response = await axios.post('http://localhost:3001/api/v1/ride', newRide, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userRides']);
      toast({
        title: 'Ride requested successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error creating ride request',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error creating ride request:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledTime = `${date}T${time}:00`;
    const newRide: RideRequest = {
      pickup_location: pickup,
      destination_location: destination,
      scheduled_time: scheduledTime,
    };
    createRideMutation.mutate(newRide);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="400px" margin="auto">
      <VStack spacing={4} align="stretch">
        <Heading size="lg" textAlign="center">Request a Ride</Heading>
        <FormControl isRequired>
          <FormLabel>Pickup Location</FormLabel>
          <Input
            placeholder="Pickup Location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Destination</FormLabel>
          <Input
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Date</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Time</FormLabel>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={createRideMutation.isLoading}
        >
          Send
        </Button>
      </VStack>
    </Box>
  );
};

export default NewRideRequest;