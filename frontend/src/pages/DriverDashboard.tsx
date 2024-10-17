import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Flex,
  Input,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Ride {
  status: string;
  id: number;
  pickup_location: string;
  destination_location: string;
  user: {
    name: string;
  };
  scheduled_time: string;
}

const DriverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen: isPinModalOpen, onOpen: onPinModalOpen, onClose: onPinModalClose } = useDisclosure();

  const [offerPrices, setOfferPrices] = useState<{ [key: number]: string }>({});
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [pin, setPin] = useState<string>("");

  const { data: rides, isLoading, isError } = useQuery<Ride[]>({
    queryKey: ['availableRides'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/api/v1/ride', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.filter((ride: Ride) => ride.status === 'requested' || ride.status === 'accepted');
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const createOfferMutation = useMutation({
    mutationFn: (newOffer: { price: number; ride_id: number }) => 
      axios.post('http://localhost:3001/api/v1/offer', newOffer, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['availableRides']);
      toast({
        title: 'Offer sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send offer',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const validatePinMutation = useMutation({
    mutationFn: async ({ rideId, pin }: { rideId: number; pin: string }) => {
      await axios.put(`http://localhost:3001/api/v1/ride/${rideId}/validate-pin`, { pin }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['availableRides']);
      toast({
        title: "PIN validated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onPinModalClose();
    },
    onError: () => {
      toast({
        title: "Invalid PIN",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSendOffer = (rideId: number) => {
    const price = parseFloat(offerPrices[rideId]);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    createOfferMutation.mutate({ price, ride_id: rideId });
    setOfferPrices({ ...offerPrices, [rideId]: '' });
  };

  const handlePinValidation = (rideId: number) => {
    setSelectedRideId(rideId);
    setPin(""); // Reset PIN input
    onPinModalOpen();
  };

  const handlePinSubmit = () => {
    if (selectedRideId) {
      validatePinMutation.mutate({ rideId: selectedRideId, pin });
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <Flex justifyContent="space-between" mb={8}>
        <Heading as="h1" size="xl">Driver Dashboard</Heading>
        <HStack spacing={4}>
          <Link to="/offers">Offers</Link>
          <Link to="/history">History</Link>
          <Link to="/profile">Profile</Link>
        </HStack>
      </Flex>

      <Heading as="h2" size="lg" mb={4}>Rides to make offer</Heading>

      {isLoading ? (
        <Text>Loading rides...</Text>
      ) : isError ? (
        <Text>Error loading rides</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {rides?.map((ride) => (
            <Box key={ride.id} p={4} borderWidth={1} borderRadius="md" borderColor={borderColor} bg={bgColor}>
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">From: {ride.pickup_location}</Text>
                <Text>To: {ride.destination_location}</Text>
                <Text>User: {ride.user.name}</Text>
                <Text>Date: {new Date(ride.scheduled_time).toLocaleString()}</Text>
                <Text>Status: {ride.status}</Text>
                {ride.status === 'requested' ? (
                  <HStack mt={2}>
                    <Input
                      placeholder="Price"
                      value={offerPrices[ride.id] || ''}
                      onChange={(e) => setOfferPrices({ ...offerPrices, [ride.id]: e.target.value })}
                      width="100px"
                    />
                    <Button colorScheme="blue" onClick={() => handleSendOffer(ride.id)}>Send Offer</Button>
                  </HStack>
                ) : ride.status === 'accepted' ? (
                  <Button colorScheme="green" onClick={() => handlePinValidation(ride.id)}>Validate PIN</Button>
                ) : null}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}

      <Modal isOpen={isPinModalOpen} onClose={onPinModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter PIN</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handlePinSubmit}>
              Submit
            </Button>
            <Button variant="ghost" onClick={onPinModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Button mt={8} onClick={handleLogout} colorScheme="red" width="100%">
        Log out
      </Button>
    </Box>
  );
};

export default DriverDashboard;