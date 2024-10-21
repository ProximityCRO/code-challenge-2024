import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  useColorModeValue,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { AiFillRobot } from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";
import { CloseIcon } from "@chakra-ui/icons";

interface Place {
  place: string;
  address: string;
  description: string;
}

interface AISuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: Place[];
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  isOpen,
  onClose,
  suggestions,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={AiFillRobot} boxSize={6} color="blue.500" />
            <Text>AI Suggestions for your destination</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {suggestions.map((place, index) => (
              <Box
                key={index}
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor={borderColor}
                bg={bgColor}
              >
                <HStack alignItems="center">
                  <Icon as={FaMapMarkerAlt} color="red.500" />
                  <Text fontWeight="bold" fontSize="lg">
                    {place.place}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  {place.address}
                </Text>
                <Text mt={2}>{place.description}</Text>
              </Box>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AISuggestions;
