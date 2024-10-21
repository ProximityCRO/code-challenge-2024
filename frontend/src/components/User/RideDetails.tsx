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
  Flex,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import {
  StarIcon,
  ChevronLeftIcon,
  TimeIcon,
  PhoneIcon,
  EmailIcon,
  InfoIcon,
} from "@chakra-ui/icons";
import AISuggestions from "./AISuggestions";

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

interface Place {
  place: string;
  address: string;
  description: string;
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

  // AI Suggestions Modal
  const [aiSuggestions, setAiSuggestions] = useState<Place[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const {
    isOpen: isAISuggestionsOpen,
    onOpen: onAISuggestionsOpen,
    onClose: onAISuggestionsClose,
  } = useDisclosure();

  // Constants
  const primaryColor = "#1F41BB";

  // Get status color
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

  // Fetch AI suggestions
  const fetchAISuggestions = async () => {
    setIsLoadingAI(true);
    const loadingToast = toast({
      title: "AI is working its magic!",
      description: (
        <HStack>
          <Spinner color="blue.500" />
          <Text>Finding the best places for you...</Text>
        </HStack>
      ),
      status: "info",
      duration: null,
      isClosable: false,
    });

    try {
      const response = await axios.post(
        "http://localhost:3001/api/v1/ride/suggestions",
        { text: rideWithOffer.destination_location },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      console.log("Raw response data:", response.data);

      let suggestions;
      if (typeof response.data === "string") {
        suggestions = JSON.parse(response.data);
      } else if (Array.isArray(response.data)) {
        suggestions = response.data;
      } else if (response.data.rideData) {
        suggestions = JSON.parse(response.data.rideData);
      } else {
        throw new Error("Unexpected response format");
      }

      if (!Array.isArray(suggestions)) {
        throw new Error(
          "Unexpected response format: suggestions is not an array"
        );
      }

      setAiSuggestions(suggestions);
      toast.close(loadingToast);
      toast({
        title: "AI Suggestions Ready!",
        description: "We've found some great places for you to explore.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onAISuggestionsOpen();
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);

      toast.close(loadingToast);
      toast({
        title: "Error fetching AI suggestions",
        description:
          "We couldn't find suggestions at this time. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

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
      maxWidth="800px"
      margin="auto"
      mt={8}
      p={6}
      borderRadius="lg"
      boxShadow="xl"
      bg="white"
    >
      <VStack spacing={6} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => navigate("/user-dashboard")}
            variant="ghost"
          >
            Back to Dashboard
          </Button>
          <Heading as="h2" size="xl" color={primaryColor}>
            Ride Details
          </Heading>
          <Box width="40px" />{" "}
          {/* This empty box is to balance the flex layout */}
        </Flex>
        <Divider />

        <Flex justifyContent="space-between" alignItems="center">
          <Badge
            colorScheme={getStatusColor(rideWithOffer.status)}
            fontSize="1em"
            p={2}
            borderRadius="full"
          >
            {rideWithOffer.status}
          </Badge>
          <Text fontWeight="bold" fontSize="lg">
            Ride #{rideWithOffer.id.toString().padStart(4, "0")}
          </Text>
        </Flex>

        <Box bg="gray.50" p={4} borderRadius="md">
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Icon as={ChevronLeftIcon} color={primaryColor} />
              <Text fontWeight="medium">
                From: {rideWithOffer.pickup_location}
              </Text>
            </HStack>
            <HStack>
              <Icon
                as={ChevronLeftIcon}
                transform="rotate(180deg)"
                color={primaryColor}
              />
              <Text fontWeight="medium">
                To: {rideWithOffer.destination_location}
              </Text>
            </HStack>
            <HStack>
              <Icon as={TimeIcon} color={primaryColor} />
              <Text>
                {new Date(rideWithOffer.scheduled_time).toLocaleString()}
              </Text>
            </HStack>
            <Button
              leftIcon={isLoadingAI ? <Spinner size="sm" /> : <InfoIcon />}
              colorScheme="teal"
              variant="outline"
              onClick={fetchAISuggestions}
              isLoading={isLoadingAI}
              loadingText="AI is thinking..."
            >
              {isLoadingAI
                ? "AI is thinking..."
                : "Get AI Suggestions for Destination"}
            </Button>
          </VStack>
        </Box>

        <Box bg="gray.50" p={4} borderRadius="md">
          <Heading size="md" mb={2}>
            Driver Information
          </Heading>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Icon as={PhoneIcon} color={primaryColor} />
              <Text>{rideWithOffer.offer.driver.name}</Text>
            </HStack>
            <HStack>
              <Icon as={EmailIcon} color={primaryColor} />
              <Text>{rideWithOffer.offer.driver.email}</Text>
            </HStack>
            <HStack>
              <Icon as={InfoIcon} color={primaryColor} />
              <Text>{`${rideWithOffer.offer.vehicle.brand} ${rideWithOffer.offer.vehicle.model} (${rideWithOffer.offer.vehicle.year})`}</Text>
            </HStack>
          </VStack>
        </Box>

        <Flex
          justifyContent="space-between"
          alignItems="center"
          bg="gray.50"
          p={4}
          borderRadius="md"
        >
          <Text fontSize="xl" fontWeight="bold">
            Price:
          </Text>
          <Text fontSize="xl" fontWeight="bold" color={primaryColor}>
            ${rideWithOffer.offer.price.toFixed(2)}
          </Text>
        </Flex>

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

      {/* AI Suggestions Modal */}
      <AISuggestions
        isOpen={isAISuggestionsOpen}
        onClose={onAISuggestionsClose}
        suggestions={aiSuggestions}
      />
    </Box>
  );
};

export default RideDetails;
