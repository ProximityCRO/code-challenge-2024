import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  useDisclosure,
  Divider,
  Progress,
  HStack,
  Icon,
  FormControl,
  FormLabel,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { StarIcon } from "@chakra-ui/icons";

// Interface definitions
interface Driver {
  id: number;
  email: string;
  name: string;
  phone_number: string;
}

interface Vehicle {
  id: number;
  driver_id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  created_at: string;
  updated_at: string;
}

interface Offer {
  id: number;
  ride_id: number;
  driver: Driver;
  vehicle: Vehicle;
  price: number;
  selected: boolean;
}

interface Ride {
  id: number;
  status: "REQUESTED" | "ACCEPTED" | "STARTED" | "COMPLETED";
  destination_location: string;
  pickup_location: string;
  scheduled_time: string;
  pin?: number;
  offer?: Offer;
  review?: {
    id: number;
    rating: number;
    comments: string;
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

const RideDetails: React.FC = () => {
  // Hooks
  const { id } = useParams<{ id: string }>();
  const rideId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State variables
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();

  // Constants
  const primaryColor = "#1F41BB";

  // Fetch ride details
  const {
    data: ride,
    isLoading: isRideLoading,
    isError: isRideError,
  } = useQuery<Ride>({
    queryKey: ["ride", rideId],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:3001/api/v1/ride/${rideId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch offers for the ride
  const {
    data: offers,
    isLoading: isOffersLoading,
    isError: isOffersError,
  } = useQuery<Offer[]>({
    queryKey: ["offers", rideId],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:3001/api/v1/offer/?ride_id=${rideId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
  });

  // Mutation to complete the ride
  const completeRideMutation = useMutation({
    mutationFn: async () => {
      await axios.patch(
        "http://localhost:3001/api/v1/ride/update-status",
        { ride_id: rideId, status: "completed" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Ride completed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries(["ride", rideId]);
      queryClient.invalidateQueries(["offers", rideId]);
      onReviewOpen();
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
      queryClient.invalidateQueries(["ride", rideId]);
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 400) {
        toast({
          title: "You have already submitted a review for this ride",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error submitting review",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  // Handle loading and error states
  if (isRideLoading || isOffersLoading) {
    return <Text>Loading ride details...</Text>;
  }

  if (isRideError || !ride || isOffersError || !offers) {
    toast({
      title: "Error loading ride details.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    navigate("/user-dashboard");
    return null;
  }

  // Find the selected offer
  const selectedOffer = offers.find((offer) => offer.selected);

  if (!selectedOffer) {
    toast({
      title: "No selected offer found for this ride.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    navigate("/user-dashboard");
    return null;
  }

  // Combine ride data with the selected offer
  const rideWithOffer = { ...ride, offer: selectedOffer };

  // Event handlers
  const handleCompleteRide = () => {
    completeRideMutation.mutate();
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

    const driverId = rideWithOffer.offer.driver.id;

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
      ride_id: rideId,
      rating,
      comments,
    });
  };

  // JSX return
  return (
    <Box
      maxWidth="600px"
      margin="auto"
      mt={8}
      p={6}
      borderWidth={1}
      borderRadius="md"
      boxShadow="lg"
      bg="white"
    >
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="xl" textAlign="center" color={primaryColor}>
          Ride Details
        </Heading>
        <Divider />
        <Text fontSize="lg">
          <strong>From:</strong> {rideWithOffer.pickup_location}
        </Text>
        <Text fontSize="lg">
          <strong>To:</strong> {rideWithOffer.destination_location}
        </Text>
        <Text fontSize="lg">
          <strong>Date:</strong>{" "}
          {new Date(rideWithOffer.scheduled_time).toLocaleString()}
        </Text>
        <Text fontSize="lg">
          <strong>Status:</strong>{" "}
          <Text as="span" fontWeight="bold" color={primaryColor}>
            {rideWithOffer.status}
          </Text>
        </Text>
        <Text fontSize="lg">
          <strong>Driver:</strong> {rideWithOffer.offer.driver.name}
        </Text>
        <Text fontSize="lg">
          <strong>Price:</strong> ${rideWithOffer.offer.price.toFixed(2)}
        </Text>
        <Divider />
        {rideWithOffer.status.toUpperCase() === "ACCEPTED" && (
          <Box
            borderWidth={2}
            borderColor={primaryColor}
            borderRadius="md"
            p={4}
            textAlign="center"
          >
            <Text fontWeight="bold" fontSize="3xl" color={primaryColor}>
              PIN: {rideWithOffer.pin}
            </Text>
            <Text fontSize="md">
              Provide this PIN to the driver to start the ride.
            </Text>
          </Box>
        )}
        {rideWithOffer.status.toUpperCase() === "STARTED" && (
          <Box>
            <Text textAlign="center" fontSize="xl" fontWeight="bold" mb={4}>
              Your ride is in progress
            </Text>
            <Progress
              value={75}
              size="lg"
              colorScheme="blue"
              isAnimated
              hasStripe
              mb={4}
            />
            <Button
              colorScheme="blue"
              onClick={handleCompleteRide}
              isLoading={completeRideMutation.isLoading}
              width="100%"
              size="lg"
            >
              Complete Ride
            </Button>
          </Box>
        )}
        {rideWithOffer.status.toUpperCase() === "COMPLETED" && (
          <Box textAlign="center">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              The ride has been completed.
            </Text>
            {rideWithOffer.review ? (
              <Text fontSize="md" color="green.500">
                Review Submitted
              </Text>
            ) : (
              <Button
                colorScheme="blue"
                onClick={onReviewOpen}
                size="lg"
                bg={primaryColor}
                _hover={{ bg: "#1A3697" }}
              >
                Leave a Review
              </Button>
            )}
          </Box>
        )}
      </VStack>

      {/* Review Modal */}
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
              isLoading={createReviewMutation.isLoading}
              _hover={{ bg: "#1A3697" }}
            >
              Submit
            </Button>
            <Button variant="ghost" onClick={onReviewClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RideDetails;
