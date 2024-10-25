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
  Icon,
  Badge,
  Stack,
} from "@chakra-ui/react";
import {
  StarIcon,
  ChevronLeftIcon,
  CalendarIcon,
  TimeIcon,
} from "@chakra-ui/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import NewRideRequest from "./NewRideRequest";
import OffersModal from "../components/User/OffersModal";

// Interface for Ride data
interface Ride {
  id: number;
  status: "REQUESTED" | "ACCEPTED" | "STARTED" | "COMPLETED";
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

// StarRating component
const StarRating = ({ rating, setRating }) => (
  <HStack spacing={2}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Icon
        key={i}
        as={StarIcon}
        color={i <= rating ? "yellow.400" : "gray.300"}
        w={8}
        h={8}
        cursor="pointer"
        onClick={() => setRating(i)}
      />
    ))}
  </HStack>
);

const UserDashboard: React.FC = () => {
  // Hooks
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  // State variables
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [reviewRideId, setReviewRideId] = useState<number | null>(null);
  const [rideIdForCompletion, setRideIdForCompletion] = useState<number | null>(
    null
  );

  // Disclosure hooks for modals
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

  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();

  // Color variables
  const primaryColor = "#1F41BB";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Fetch rides data
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

  // Mutation to delete a ride
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

  // Mutation to complete a ride
  const completeRideMutation = useMutation({
    mutationFn: async (rideId: number) => {
      const response = await axios.patch(
        "http://localhost:3001/api/v1/ride/update-status",
        { ride_id: rideId, status: "completed" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userRides"]);
      toast({
        title: "Ride completed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      handleReview(rideIdForCompletion!);
    },
    onError: () => {
      toast({
        title: "Error completing ride",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Mutation to create a review
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      driver_id: number;
      user_id: number;
      ride_id: number;
      rating: number;
      comments: string;
    }) => {
      const response = await axios.post(
        "http://localhost:3001/api/v1/review",
        reviewData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Review submitted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onReviewClose();
      setRating(0);
      setComments("");
      queryClient.invalidateQueries(["userRides"]);
    },
    onError: () => {
      toast({
        title: "Error submitting review",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Event handlers
  const handleLogout = () => {
    logout();
  };

  const handleViewRide = (ride: Ride) => {
    navigate(`/ride/${ride.id}`, { state: ride });
  };

  const handleOffers = (rideId: number) => {
    setSelectedRideId(rideId);
    onOffersOpen();
  };

  const handleDeleteRide = (rideId: number) => {
    deleteRideMutation.mutate(rideId);
  };

  const handleCompleteRide = (rideId: number) => {
    setRideIdForCompletion(rideId);
    completeRideMutation.mutate(rideId);
  };

  const handleReview = (rideId: number) => {
    setReviewRideId(rideId);
    onReviewOpen();
  };

  const handleSubmitReview = () => {
    if (!rating) {
      toast({
        title: "Please provide a rating",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const ride = rides?.find((ride) => ride.id === reviewRideId);
    const driverId = ride?.offer?.driver_id;

    if (!driverId) {
      toast({
        title: "Driver not found",
        status: "error",
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

  // Utility function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "REQUESTED":
        return "yellow";
      case "ACCEPTED":
        return "green";
      case "STARTED":
        return "blue";
      case "COMPLETED":
        return "purple";
      default:
        return "gray";
    }
  };

  // Function to render action buttons based on ride status
  const renderRideButton = (ride: Ride) => {
    switch (ride.status.toUpperCase()) {
      case "REQUESTED":
        return (
          <Stack direction="row" spacing={2}>
            <Button
              bg={primaryColor}
              _hover={{ bg: "#15339E" }}
              color="white"
              onClick={() => handleOffers(ride.id)}
            >
              Offers
            </Button>
            <Button colorScheme="red" onClick={() => handleDeleteRide(ride.id)}>
              Delete
            </Button>
          </Stack>
        );
      case "ACCEPTED":
        return (
          <Button colorScheme="green" onClick={() => handleViewRide(ride)}>
            See Ride Details
          </Button>
        );
      case "STARTED":
        return (
          <Button
            colorScheme="orange"
            onClick={() => handleCompleteRide(ride.id)}
          >
            Complete Ride
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

  // JSX return
  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      {/* Navigation Menu */}
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="xl" color={primaryColor}>
          My Rides
        </Heading>
        <HStack spacing={4}>
          <Link to="/ride-history">History</Link>
          <Link to="/profile">Profile</Link>
          <Button onClick={handleLogout} variant="outline" colorScheme="red">
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* New Request Button */}
      <Button
        bg={primaryColor}
        color="white"
        size="lg"
        width="100%"
        mb={8}
        _hover={{ bg: "#15339E" }}
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
              <StarRating rating={rating} setRating={setRating} />
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
            <Button
              bg={primaryColor}
              color="white"
              mr={3}
              onClick={handleSubmitReview}
              _hover={{ bg: "#15339E" }}
            >
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
        <VStack spacing={6} align="stretch">
          {rides
            ?.filter((ride) => ride.status.toUpperCase() !== "COMPLETED")
            .map((ride) => (
              <Box
                key={ride.id}
                p={6}
                borderWidth={1}
                borderRadius="lg"
                borderColor={borderColor}
                bg={bgColor}
                boxShadow="md"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
              >
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                  <Badge
                    colorScheme={getStatusColor(ride.status)}
                    fontSize="0.8em"
                    p={2}
                    borderRadius="full"
                  >
                    {ride.status}
                  </Badge>
                  <Text fontWeight="bold" fontSize="lg">
                    Ride #{ride.id.toString().padStart(4, "0")}
                  </Text>
                </Flex>

                <VStack align="stretch" spacing={3} mb={4}>
                  <HStack>
                    <Icon as={ChevronLeftIcon} color={primaryColor} />
                    <Text fontWeight="medium">
                      From: {ride.pickup_location}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon
                      as={ChevronLeftIcon}
                      transform="rotate(180deg)"
                      color={primaryColor}
                    />
                    <Text fontWeight="medium">
                      To: {ride.destination_location}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={CalendarIcon} color={primaryColor} />
                    <Text>
                      {new Date(ride.scheduled_time).toLocaleDateString()}
                    </Text>
                  </HStack>
                  <HStack>
                    <Icon as={TimeIcon} color={primaryColor} />
                    <Text>
                      {new Date(ride.scheduled_time).toLocaleTimeString()}
                    </Text>
                  </HStack>
                  {ride.offer &&
                    ride.status.toUpperCase() !== "REQUESTED" && (
                      <HStack>
                        <Text fontWeight="bold" color={primaryColor}>
                          $
                        </Text>
                        <Text fontWeight="bold">
                          {ride.offer.price.toFixed(2)}
                        </Text>
                      </HStack>
                    )}
                </VStack>

                <Box>{renderRideButton(ride)}</Box>
              </Box>
            ))}
        </VStack>
      )}
    </Box>
  );
};

export default UserDashboard;
