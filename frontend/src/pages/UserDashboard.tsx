import React, { useState } from 'react';
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
import OffersModal from '../components/User/OffersModal';

// Update the Ride interface to include all necessary fields
interface Ride {
  id: number;
  status: 'REQUESTED' | 'ACCEPTED' | 'COMPLETED';
  destination_location: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen: isNewRequestOpen, onOpen: onNewRequestOpen, onClose: onNewRequestClose } = useDisclosure();
  const { isOpen: isOffersOpen, onOpen: onOffersOpen, onClose: onOffersClose } = useDisclosure();
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const {logout} = useAuth();

  const handleLogout = () => {
    logout();
  };

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
    switch (ride.status.toUpperCase()) {
      case 'REQUESTED':
        return (
          <Button colorScheme="blue" onClick={() => handleOffers(ride.id)}>
            Offers
          </Button>
        );
      case 'ACCEPTED':
        return (
          <Button colorScheme="green" onClick={() => handlePin(ride.id)}>
            PIN
          </Button>
        );
      case 'COMPLETED':
        return (
          <Button colorScheme="purple" onClick={() => handleReview(ride.id)}>
            Review
          </Button>
        );
      default:
        return null;
    }
  };

  const handleOffers = (rideId: number) => {
    setSelectedRideId(rideId);
    onOffersOpen();
  };

  const handlePin = (rideId: number) => {
    console.log(`View PIN for ride ${rideId}`);
    // Implement logic to view PIN
  };

  const handleReview = (rideId: number) => {
    console.log(`Review ride ${rideId}`);
    // Implement logic to leave a review
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      {/* Navigation Menu */}
      <Flex justifyContent="space-between" mb={8}>
        <Heading as="h1" size="xl">My Rides</Heading>
        <HStack spacing={4}>
          <Link to="/history">History</Link>
          <Link to="/profile">Profile</Link>
          <Button onClick={handleLogout}>Logout</Button>
        </HStack>
      </Flex>

      {/* New Request Button */}
      <Button colorScheme="blue" size="lg" width="100%" mb={8} onClick={onNewRequestOpen}>
        New Request
      </Button>

      {/* Modal for New Ride Request */}
      <Modal isOpen={isNewRequestOpen} onClose={onNewRequestClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <NewRideRequest onClose={onNewRequestClose} />
        </ModalContent>
      </Modal>

      {/* Offers Modal */}
      {selectedRideId && (
        <OffersModal isOpen={isOffersOpen} onClose={onOffersClose} rideId={selectedRideId} />
      )}

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
                  <Text fontWeight="bold">Request #{ride.id.toString().padStart(4, '0')}</Text>
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