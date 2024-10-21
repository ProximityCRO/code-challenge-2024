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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

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

const RideDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const rideId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");

  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();

  // Obtener los detalles del ride
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
    refetchInterval: 5000, // Refrescar cada 5 segundos
  });

  // Obtener las ofertas del ride
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

  // Mutación para completar el ride
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

  // Mutación para crear una reseña
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

  // Manejo de estados de carga y error
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

  // Encontrar la oferta seleccionada
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

  // Crear un nuevo objeto ride que incluya la oferta seleccionada
  const rideWithOffer = { ...ride, offer: selectedOffer };

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
          <strong>From:</strong> {rideWithOffer.pickup_location}
        </Text>
        <Text>
          <strong>To:</strong> {rideWithOffer.destination_location}
        </Text>
        <Text>
          <strong>Date:</strong>{" "}
          {new Date(rideWithOffer.scheduled_time).toLocaleString()}
        </Text>
        <Text>
          <strong>Status:</strong> {rideWithOffer.status}
        </Text>
        <Text>
          <strong>Driver:</strong> {rideWithOffer.offer.driver.name}
        </Text>
        <Text>
          <strong>Price:</strong> ${rideWithOffer.offer.price.toFixed(2)}
        </Text>
        <Divider />
        {rideWithOffer.status.toUpperCase() === "ACCEPTED" && (
          <>
            <Text fontWeight="bold" fontSize="2xl" textAlign="center">
              PIN: {rideWithOffer.pin}
            </Text>
            <Text textAlign="center">
              Provide this PIN to the driver to start the ride.
            </Text>
          </>
        )}
        {rideWithOffer.status.toUpperCase() === "STARTED" && (
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
        {rideWithOffer.status.toUpperCase() === "COMPLETED" && (
          <>
            <Text textAlign="center">The ride has been completed.</Text>
            {rideWithOffer.review ? (
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

      {/* Review Modal */}
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
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSubmitReview}
              isLoading={createReviewMutation.isLoading}
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
