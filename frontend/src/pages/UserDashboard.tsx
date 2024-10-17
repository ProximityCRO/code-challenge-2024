import React, { useState } from "react";
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
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Input,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import NewRideRequest from "./NewRideRequest";
import OffersModal from "../components/User/OffersModal";
import { useNavigate } from "react-router-dom";

interface Ride {
  id: number;
  status: "REQUESTED" | "ACCEPTED" | "COMPLETED";
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

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const {
    isOpen: isNewRequestOpen,
    onOpen: onNewRequestOpen,
    onClose: onNewRequestClose,
  } = useDisclosure();
  const {
    isOpen: isOffersOpen,
    onOpen: onOffersOpen,
    onClose: onOffersClose,
  } = useDisclosure();
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const handleViewRide = (rideId: number) => {
    navigate(`/ride/${rideId}`);
  };

  const {
    data: rides,
    isLoading,
    isError,
  } = useQuery<Ride[]>({
    queryKey: ["userRides"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:3001/api/v1/ride", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data;
    },
    refetchInterval: 5000,
  });

  const deleteRideMutation = useMutation({
    mutationFn: async (rideId: number) => {
      await axios.delete(`http://localhost:3001/api/v1/ride/${rideId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userRides"]);
      toast({
        title: "Ride deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: "Error deleting ride",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleLogout = () => {
    logout();
  };

  const renderRideButton = (ride: Ride) => {
    switch (ride.status.toUpperCase()) {
      case "REQUESTED":
        return (
          <VStack>
            <Button colorScheme="blue" onClick={() => handleOffers(ride.id)}>
              Offers
            </Button>
            <Button colorScheme="red" onClick={() => handleDeleteRide(ride.id)}>
              Delete
            </Button>
          </VStack>
        );
      case "ACCEPTED":
        return (
          <Button colorScheme="green" onClick={() => handleViewRide(ride.id)}>
            PIN
          </Button>
        );
      case "COMPLETED":
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

  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [reviewRideId, setReviewRideId] = useState<number | null>(null);

  const handleReview = (rideId: number) => {
    setReviewRideId(rideId);
    onReviewOpen();
  };

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      driver_id: number;
      user_id: number;
      ride_id: number;
      rating: number;
      comments: string;
    }) => {
      const response = await axios.post('http://localhost:3001/api/v1/review', reviewData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Review submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onReviewClose();
      setRating(0);
      setComments('');
      queryClient.invalidateQueries(['userRides']);
    },
    onError: () => {
      toast({
        title: 'Error submitting review',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });
  
  const handleSubmitReview = () => {
    if (!rating) {
      toast({
        title: 'Please provide a rating',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    const ride = rides?.find((ride) => ride.id === reviewRideId);
    const driverId = ride?.offer?.driver_id;
  
    if (!driverId) {
      toast({
        title: 'Driver not found',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    createReviewMutation.mutate({
      driver_id: driverId,
      user_id: user!.id,
      ride_id: reviewRideId!,
      rating,
      comments,
    });
  };
  

  const handleDeleteRide = (rideId: number) => {
    deleteRideMutation.mutate(rideId);
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      {/* Navigation Menu */}
      <Flex justifyContent="space-between" mb={8}>
        <Heading as="h1" size="xl">
          My Rides
        </Heading>
        <HStack spacing={4}>
          <Link to="/history">History</Link>
          <Link to="/profile">Profile</Link>
          <Button onClick={handleLogout}>Logout</Button>
        </HStack>
      </Flex>

      {/* New Request Button */}
      <Button
        colorScheme="blue"
        size="lg"
        width="100%"
        mb={8}
        onClick={onNewRequestOpen}
      >
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

      {/* Modal for Review */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave a Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Rating</FormLabel>
              <Input
                type="number"
                max={5}
                min={1}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Comments</FormLabel>
              <Textarea
                placeholder="Write your comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmitReview}>
              Submit
            </Button>
            <Button variant="ghost" onClick={onReviewClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Offers Modal */}
      {selectedRideId && (
        <OffersModal
          isOpen={isOffersOpen}
          onClose={onOffersClose}
          rideId={selectedRideId}
        />
      )}

      {/* Rides List */}
      {isLoading ? (
        <Text>Loading rides...</Text>
      ) : isError ? (
        <Text>Error loading rides</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {rides?.map((ride) => (
            <Box
              key={ride.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              borderColor={borderColor}
              bg={bgColor}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">
                    Request #{ride.id.toString().padStart(4, "0")}
                  </Text>
                  <Text fontSize="sm">From: {ride.pickup_location}</Text>
                  <Text fontSize="sm">To: {ride.destination_location}</Text>
                  <Text fontSize="sm">
                    Date: {new Date(ride.scheduled_time).toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Status: {ride.status}
                  </Text>
                  {ride.offer && (
                    <Text fontSize="sm">
                      Price: ${ride.offer.price.toFixed(2)}
                    </Text>
                  )}
                </VStack>
                <Box>{renderRideButton(ride)}</Box>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default UserDashboard;
