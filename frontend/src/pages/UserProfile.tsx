import React from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  useColorModeValue,
  HStack,
  Avatar,
  Icon,
  Button,
  useToast,
} from "@chakra-ui/react";
import {
  StarIcon,
  EmailIcon,
  PhoneIcon,
  ArrowBackIcon,
} from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Interface definitions
interface Review {
  id: number;
  driver_id: number;
  user_id: number;
  ride_id: number;
  rating: number;
  comments: string;
}

interface Vehicle {
  id: number;
  driver_id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
}

interface UserProfileData {
  name: string;
  email: string;
  phone_number: string;
  role: "user" | "driver";
  vehicle: Vehicle | null;
  reviews: Review[] | null;
}

const UserProfile: React.FC = () => {
  // Hooks and context
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Theme variables
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const primaryColor = "#1F41BB";

  // Fetch user profile data
  const {
    data: profileData,
    isLoading,
    isError,
  } = useQuery<UserProfileData>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:3001/api/v1/auth/profile/",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
  });

  if (isLoading) {
    return <Text>Loading profile...</Text>;
  }

  if (isError || !profileData) {
    toast({
      title: "Error loading profile.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return null;
  }

  return (
    <Box
      maxWidth="600px"
      margin="auto"
      mt={8}
      p={6}
      bg={bgColor}
      borderWidth={1}
      borderRadius="md"
      borderColor={borderColor}
    >
      {/* Go Back Button */}
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        onClick={() => navigate(-1)}
        mb={4}
      >
        Back
      </Button>

      <VStack spacing={6} align="stretch">
        {/* User Info */}
        <HStack spacing={4}>
          <Avatar size="xl" name={profileData.name} />
          <Box>
            <Heading as="h2" size="lg">
              {profileData.name}
            </Heading>
            <Text fontSize="md" color="gray.500">
              {profileData.role.toUpperCase()}
            </Text>
          </Box>
        </HStack>

        <Divider />

        {/* Contact Info */}
        <VStack align="start" spacing={3}>
          <HStack>
            <Icon as={EmailIcon} color={primaryColor} />
            <Text>{profileData.email}</Text>
          </HStack>
          <HStack>
            <Icon as={PhoneIcon} color={primaryColor} />
            <Text>{profileData.phone_number}</Text>
          </HStack>
        </VStack>

        {/* Vehicle Info for Drivers */}
        {profileData.role === "driver" && profileData.vehicle && (
          <>
            <Divider />
            <Heading as="h3" size="md">
              Vehicle Information
            </Heading>
            <VStack align="start" spacing={3}>
              <Text>
                <strong>Brand:</strong> {profileData.vehicle.brand}
              </Text>
              <Text>
                <strong>Model:</strong> {profileData.vehicle.model}
              </Text>
              <Text>
                <strong>Year:</strong> {profileData.vehicle.year}
              </Text>
              <Text>
                <strong>Color:</strong> {profileData.vehicle.color}
              </Text>
            </VStack>
          </>
        )}

        {/* Reviews for Drivers */}
        {profileData.role === "driver" &&
          profileData.reviews &&
          profileData.reviews.length > 0 && (
            <>
              <Divider />
              <Heading as="h3" size="md">
                Reviews
              </Heading>
              <VStack align="start" spacing={4}>
                {profileData.reviews.map((review) => (
                  <Box
                    key={review.id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    width="100%"
                  >
                    <HStack spacing={1} alignItems="center">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          as={StarIcon}
                          color={i < review.rating ? "yellow.400" : "gray.300"}
                        />
                      ))}
                    </HStack>
                    <Text mt={2} fontStyle="italic">
                      "{review.comments}"
                    </Text>
                  </Box>
                ))}
              </VStack>
            </>
          )}

        {/* Logout Button */}
        <Divider />
        <Button colorScheme="red" onClick={logout}>
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default UserProfile;
