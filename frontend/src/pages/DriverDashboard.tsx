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
import { Link } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

// Interface definitions
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
  offer?: {
    price: number;
  };
  review?: Review;
}

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

const DriverDashboard: React.FC = () => {
  // Context hook
  const { user, logout } = useAuth();

  // State variables
  const [offerPrices, setOfferPrices] = useState<{ [key: number]: string }>({});
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [pin, setPin] = useState<string>("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Disclosure hooks for modals
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();

  // Color mode and toast hooks
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  // Query client
  const queryClient = useQueryClient();

  // Fetch rides data
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

  // Mutation to create an offer
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

  // Mutation to update ride status
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

  // Mutation to validate PIN
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
        // PIN is valid
        toast({
          title: "PIN validated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        updateRideStatusMutation.mutate({
          ride_id: selectedRideId!,
          status: "started",
        });
      } else {
        // Invalid PIN
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

  // Event handlers
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

  // Handle PIN submission
  const handlePinSubmit = () => {
    if (selectedRideId) {
      validatePinMutation.mutate({ ride_id: selectedRideId, pin });
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    onReviewOpen();
  };

  const handleLogout = () => {
    logout();
  };

  // Constants
  const primaryColor = "#1F41BB";

  // Function to render action buttons based on ride status
  const renderRideButton = (ride: Ride) => {
    switch (ride.status.toUpperCase()) {
      case "REQUESTED":
        return (
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
              bg={primaryColor}
              _hover={{ bg: "#15339E" }}
              color="white"
              onClick={() => handleSendOffer(ride.id)}
            >
              Send Offer
            </Button>
          </HStack>
        );
      case "ACCEPTED":
        return (
          <Button
            colorScheme="green"
            onClick={() => handlePinValidation(ride.id)}
          >
            Validate PIN
          </Button>
        );
      case "STARTED":
        return (
          <Text fontWeight="bold" color="blue.500">
            Ride in progress
          </Text>
        );
      case "COMPLETED":
        return (
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
        );
      default:
        return null;
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      {/* Navigation Menu */}
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="xl" color={primaryColor}>
          My Rides
        </Heading>
        <HStack spacing={4}>
          <Link to="/offers">Offers</Link>
          <Link to="/driver-history">History</Link>
          <Link to="/profile">Profile</Link>
          <Button onClick={handleLogout} variant="outline" colorScheme="red">
            Logout
          </Button>
        </HStack>
      </Flex>

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
                  <HStack>
                    <Text fontWeight="medium">User: {ride.user.name}</Text>
                  </HStack>
                  {ride.offer && ride.offer.price && (
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

      {/* PIN Validation Modal */}
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

      {/* Review Modal */}
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

      {/* Logout Button */}
      <Button mt={8} onClick={handleLogout} colorScheme="red" width="100%">
        Log out
      </Button>
    </Box>
  );
};

export default DriverDashboard;
