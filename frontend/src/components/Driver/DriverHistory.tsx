import React from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  useColorModeValue, 
  Flex, 
  Badge, 
  HStack,
  Button,
  Icon
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronLeftIcon, StarIcon, CalendarIcon, TimeIcon, CheckIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

interface Ride {
  id: number;
  status: string;
  pickup_location: string;
  destination_location: string;
  scheduled_time: string;
  offer?: {
    price: number;
  };
  review?: {
    rating: number;
    comments: string;
  };
}

const DriverHistory: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const primaryColor = "#1F41BB";
  const navigate = useNavigate();

  const { data: rides, isLoading, isError } = useQuery<Ride[]>({
    queryKey: ["driverRides"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:3001/api/v1/ride", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    },
  });

  const completedRides = rides?.filter(ride => ride.status.toUpperCase() === 'COMPLETED');

  return (
    <Box maxWidth="800px" margin="auto" mt={4} p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Button leftIcon={<ChevronLeftIcon />} onClick={() => navigate(-1)} variant="ghost">
          Back
        </Button>
        <Heading as="h1" size="xl" color={primaryColor}>
          Ride History
        </Heading>
        <Box width="40px" /> {/* This empty box is to balance the flex layout */}
      </Flex>
      
      {isLoading ? (
        <Text>Loading ride history...</Text>
      ) : isError ? (
        <Text>Error loading ride history</Text>
      ) : (
        <VStack spacing={6} align="stretch">
          {completedRides?.map(ride => (
            <Box
              key={ride.id}
              p={6}
              borderWidth={1}
              borderRadius="lg"
              borderColor={borderColor}
              bg={bgColor}
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            >
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Badge colorScheme="green" fontSize="0.8em" p={2} borderRadius="full">
                  <Icon as={CheckIcon} mr={1} /> Completed
                </Badge>
                <Text fontWeight="bold" fontSize="lg">
                  Ride #{ride.id.toString().padStart(4, '0')}
                </Text>
              </Flex>
              
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Icon as={ChevronLeftIcon} color={primaryColor} />
                  <Text fontWeight="medium">From: {ride.pickup_location}</Text>
                </HStack>
                <HStack>
                  <Icon as={ChevronLeftIcon} transform="rotate(180deg)" color={primaryColor} />
                  <Text fontWeight="medium">To: {ride.destination_location}</Text>
                </HStack>
                <HStack>
                  <Icon as={CalendarIcon} color={primaryColor} />
                  <Text>{new Date(ride.scheduled_time).toLocaleDateString()}</Text>
                </HStack>
                <HStack>
                  <Icon as={TimeIcon} color={primaryColor} />
                  <Text>{new Date(ride.scheduled_time).toLocaleTimeString()}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" color={primaryColor}>$</Text>
                  <Text fontWeight="bold">{ride.offer?.price.toFixed(2)}</Text>
                </HStack>
              </VStack>
              
              {ride.review && (
                <Box mt={4} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <Flex alignItems="center" mb={2}>
                    <Icon as={StarIcon} color="yellow.400" mr={2} />
                    <Text fontWeight="bold">Rating: {ride.review.rating} / 5</Text>
                  </Flex>
                  <Text fontStyle="italic">"{ride.review.comments}"</Text>
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default DriverHistory;