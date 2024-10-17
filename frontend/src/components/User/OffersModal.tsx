import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Select,
  Link,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Offer {
  id: number;
  ride_id: number;
  driver: {
    id: number;
    name: string;
    rating: number;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
    color: string;
  };
  price: number;
  selected: boolean;
}

interface OffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: number;
}

const OffersModal: React.FC<OffersModalProps> = ({
  isOpen,
  onClose,
  rideId,
}) => {
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");

  const {
    data: offers,
    isLoading,
    isError,
  } = useQuery<Offer[]>({
    queryKey: ["offers", rideId],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:3001/api/v1/offer/?ride_id=${rideId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log(response.data);
      return response.data;
    },
    refetchInterval: 5000, // Polling every 5 seconds
  });

  const sortedOffers = offers?.sort((a, b) =>
    sortBy === "price" ? a.price - b.price : b.rating - a.rating
  );

  const handleAccept = (offerId: number) => {
    // Implement accept logic
    console.log(`Accepted offer ${offerId}`);
  };

  const handleDecline = (offerId: number) => {
    // Implement decline logic
    console.log(`Declined offer ${offerId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Offers</ModalHeader>
        <ModalBody>
          <Select
            mb={4}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "price" | "rating")}
          >
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
          </Select>
          {isLoading ? (
            <Text>Loading offers...</Text>
          ) : isError ? (
            <Text>Error loading offers</Text>
          ) : sortedOffers && sortedOffers.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {sortedOffers.map((offer) => (
                <Box key={offer.id} p={4} borderWidth={1} borderRadius="md">
                  <Text>Driver: {offer.driver.name}</Text>
                  <Text>Price: ${offer.price.toFixed(2)}</Text>
                  <Text>
                    Rating: {offer.driver.rating} (
                    <Link href="#">Go to Reviews</Link>)
                  </Text>
                  <Text>
                    Vehicle: {offer.vehicle.brand} {offer.vehicle.model}
                  </Text>
                  <HStack mt={2} spacing={2}>
                    <Button
                      colorScheme="green"
                      onClick={() => handleAccept(offer.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => handleDecline(offer.id)}
                    >
                      Decline
                    </Button>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text>No offers available yet.</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OffersModal;
