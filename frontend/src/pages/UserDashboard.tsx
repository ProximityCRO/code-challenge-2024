import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Flex,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import NewRideRequest from './NewRideRequest';

// Define the Ride interface
interface Ride {
  id: number;
  status: 'REQUESTED' | 'ACCEPTED' | 'COMPLETED';
  pickup_location: string;
  destination_location: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch user's rides
  const { data: rides, isLoading, isError } = useQuery<Ride[]>({
    queryKey: ['userRides'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/api/v1/ride', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    }
  });

  // Function to render the appropriate button based on ride status
  const renderRideButton = (ride: Ride) => {
    switch (ride.status) {
      case 'REQUESTED':
        return <Button colorScheme="blue">Offers</Button>;
      case 'ACCEPTED':
        return <Button colorScheme="green">PIN</Button>;
      case 'COMPLETED':
        return <Button colorScheme="purple">Review</Button>;
      default:
        return null;
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      {/* Navigation Menu */}
      <Flex justifyContent="space-between" mb={8}>
        <Heading as="h1" size="xl">My Rides</Heading>
        <HStack spacing={4}>
          <Link to="/history">History</Link>
          <Link to="/profile">Profile</Link>
        </HStack>
      </Flex>

      {/* New Request Button */}
      <Button colorScheme="blue" size="lg" width="100%" mb={8} onClick={onOpen}>
        New Request
      </Button>

      {/* Modal for New Ride Request */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <NewRideRequest onClose={onClose} />
        </ModalContent>
      </Modal>

      {/* Rides List */}
      {isLoading ? (
        <Text>Loading rides...</Text>
      ) : isError ? (
        <Text>Error loading rides</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {rides?.map((ride) => (
            <Box key={ride.id} p={4} borderWidth={1} borderRadius="md" borderColor={borderColor} bg={bgColor}>
              <Flex justifyContent="space-between" alignItems="center">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Request #{ride.id}</Text>
                  <Text fontSize="sm">To: {ride.destination_location}</Text>
                  <Text fontSize="sm" color="gray.500">Status: {ride.status}</Text>
                </VStack>
                {renderRideButton(ride)}
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default UserDashboard;