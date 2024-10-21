import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Divider,
} from "@chakra-ui/react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

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

const RideDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const rideId = Number(id);
  const location = useLocation();

  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");

  const navigate = useNavigate();

  const queryClient = useQueryClient();
  let ride = location.state?.ride as Ride | undefined;

  if (!ride) {
    const rides = queryClient.getQueryData<Ride[]>(["userRides"]);
    ride = rides?.find((ride) => ride.id === rideId);
  }

  if (!ride) {
    useEffect(() => {
      navigate("/user-dashboard");
    }, [navigate]);
    return <Text>Ride not found</Text>;
  }

  const toast = useToast();
  const { user } = useAuth();

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
      queryClient.invalidateQueries(["userRides"]);
      queryClient.invalidateQueries(["ride", rideId]);
      // Actualizar el estado local del ride
      setRide((prevRide) =>
        prevRide ? { ...prevRide, status: "COMPLETED" } : prevRide
      );
      // Abrir el modal para dejar una reseña
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

  const handleCompleteRide = () => {
    completeRideMutation.mutate();
  };

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
      queryClient.invalidateQueries(["driverReviews"]);
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
      ride_id: rideId,
      rating,
      comments,
    });
  };

  return (
    <Box
      maxWidth="600px"
      margin="auto"
      mt={8}
      p={6}
      borderWidth={1}
      borderRadius="md"
      boxShadow="md"
    >
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg" textAlign="center">
          Ride Details
        </Heading>
        <Divider />
        <Text>
          <strong>From:</strong> {ride.pickup_location}
        </Text>
        <Text>
          <strong>To:</strong> {ride.destination_location}
        </Text>
        <Text>
          <strong>Date:</strong>{" "}
          {new Date(ride.scheduled_time).toLocaleString()}
        </Text>
        <Text>
          <strong>Status:</strong> {ride.status}
        </Text>
        {ride.offer && (
          <Text>
            <strong>Price:</strong> ${ride.offer.price.toFixed(2)}
          </Text>
        )}
        <Divider />
        {ride.status.toUpperCase() === "ACCEPTED" && (
          <>
            <Text fontWeight="bold" fontSize="2xl" textAlign="center">
              PIN: {ride.pin}
            </Text>
            <Text textAlign="center">
              Provide this PIN to the driver to start the ride.
            </Text>
          </>
        )}
        {ride.status.toUpperCase() === "STARTED" && (
          <>
            <Text textAlign="center">Your ride is in progress.</Text>
            <Button
              colorScheme="orange"
              onClick={handleCompleteRide}
              isLoading={completeRideMutation.isLoading}
            >
              Complete Ride
            </Button>
          </>
        )}
        {ride.status.toUpperCase() === "COMPLETED" && (
          <>
            <Text textAlign="center">The ride has been completed.</Text>
            {ride.review ? (
              <Text fontSize="sm" color="green.500" textAlign="center">
                Review Submitted
              </Text>
            ) : (
              <Button colorScheme="purple" onClick={onReviewOpen}>
                Leave a Review
              </Button>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default RideDetails;
