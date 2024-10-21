import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

interface Review {
  id: number;
  rating: number;
  comments: string;
  user_id: number;
  driver_id: number;
  ride_id: number;
}

interface Ride {
  id: number;
  status: string;
  pickup_location: string;
  destination_location: string;
  user: {
    name: string;
  };
  scheduled_time: string;
  review?: Review;
}

const DriverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [offerPrices, setOfferPrices] = useState<{ [key: number]: string }>({});
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [pin, setPin] = useState<string>("");

  const {
    data: rides,
    isLoading,
    isError,
  } = useQuery<Ride[]>({
    queryKey: ["driverRides"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:3001/api/v1/ride", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data;
    },
    refetchInterval: 5000,
  });

  const createOfferMutation = useMutation({
    mutationFn: (newOffer: { price: number; ride_id: number }) =>
      axios.post("http://localhost:3001/api/v1/offer", newOffer, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["driverRides"]);
      toast({
        title: "Offer sent successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: "Failed to send offer",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateRideStatusMutation = useMutation({
    mutationFn: async (data: { ride_id: number; status: string }) => {
      const response = await axios.patch(
        "http://localhost:3001/api/v1/ride/update-status",
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["driverRides"]);
      toast({
        title: "Ride status updated to started",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: "Error updating ride status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const validatePinMutation = useMutation({
    mutationFn: async (data: { ride_id: number; pin: string }) => {
      const response = await axios.post(
        "http://localhost:3001/api/v1/ride/validation",
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.validation) {
        toast({
          title: "PIN validated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        updateRideStatusMutation.mutate({
          ride_id: selectedRideId,
          status: "started",
        });
      } else {
        toast({
          title: "Invalid PIN",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error validating PIN",
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
        title: "Invalid price",
        description: "Please enter a valid price",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    createOfferMutation.mutate({ price, ride_id: rideId });
    setOfferPrices({ ...offerPrices, [rideId]: "" });
  };

  const handlePinValidation = (rideId: number) => {
    setSelectedRideId(rideId);
    setPin("");
    onOpen();
  };

  const handlePinSubmit = () => {
    if (selectedRideId) {
      validatePinMutation.mutate({ ride_id: selectedRideId, pin });
    }
  };

  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    onReviewOpen();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <Flex justifyContent="space-between" mb={8}>
        <Heading as="h1" size="xl">
          Driver Dashboard
        </Heading>
        <HStack spacing={4}>
          <Link to="/offers">Offers</Link>
          <Link to="/driver-history">History</Link>
          <Link to="/profile">Profile</Link>
        </HStack>
      </Flex>

      <Heading as="h2" size="lg" mb={4}>
        Available Rides
      </Heading>

      {isLoading ? (
        <Text>Loading rides...</Text>
      ) : isError ? (
        <Text>Error loading rides</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {rides?.filter(ride => ride.status.toUpperCase() !== 'COMPLETED').map((ride) => (
            <Box
              key={ride.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              borderColor={borderColor}
              bg={bgColor}
            >
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">From: {ride.pickup_location}</Text>
                <Text>To: {ride.destination_location}</Text>
                <Text>User: {ride.user.name}</Text>
                <Text>
                  Date: {new Date(ride.scheduled_time).toLocaleString()}
                </Text>
                <Text>Status: {ride.status}</Text>
                {ride.status.toUpperCase() === "REQUESTED" ? (
                  <HStack mt={2}>
                    <Input
                      placeholder="Price"
                      value={offerPrices[ride.id] || ""}
                      onChange={(e) =>
                        setOfferPrices({
                          ...offerPrices,
                          [ride.id]: e.target.value,
                        })
                      }
                      width="100px"
                    />
                    <Button
                      colorScheme="blue"
                      onClick={() => handleSendOffer(ride.id)}
                    >
                      Send Offer
                    </Button>
                  </HStack>
                ) : ride.status.toUpperCase() === "ACCEPTED" ? (
                  <Button
                    colorScheme="green"
                    onClick={() => handlePinValidation(ride.id)}
                  >
                    Validate PIN
                  </Button>
                ) : ride.status.toUpperCase() === "STARTED" ? (
                  <Text fontWeight="bold" color="blue.500">
                    Ride in progress
                  </Text>
                ) : ride.status.toUpperCase() === "COMPLETED" ? (
                  <>
                    <Text fontWeight="bold" color="blue.500">
                      Ride Completed
                    </Text>
                    {ride.review && (
                      <Button
                        colorScheme="teal"
                        onClick={() => handleViewReview(ride.review)}
                      >
                        View Review
                      </Button>
                    )}
                  </>
                ) : null}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
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
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Button mt={8} onClick={handleLogout} colorScheme="red" width="100%">
        Log out
      </Button>

      <Modal isOpen={isReviewOpen} onClose={onReviewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>User Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReview && (
              <>
                <Text>
                  <strong>Rating:</strong> {selectedReview.rating} / 5
                </Text>
                <Text>
                  <strong>Comments:</strong> {selectedReview.comments}
                </Text>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onReviewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DriverDashboard;
