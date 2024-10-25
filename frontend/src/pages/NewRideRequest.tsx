import React, { useState, useEffect } from "react";
import {
  VStack,
  Heading,
  Input,
  Button,
  useToast,
  FormControl,
  FormLabel,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { useAuth } from "../contexts/AuthContext";

interface RideRequest {
  pickup_location: string;
  destination_location: string;
  scheduled_time: string;
}

const NewRideRequest: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const now = new Date();
  const initialDate = now.toISOString().split("T")[0];
  const initialTime = now.toTimeString().slice(0, 5);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [isFormValid, setIsFormValid] = useState(false);

  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const primaryColor = "#1F41BB";

  // Validate form fields
  useEffect(() => {
    const validateForm = () => {
      const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(date);
      const isTimeValid = /^\d{2}:\d{2}$/.test(time);
      const isPickupValid = pickup.trim().length > 0;
      const isDestinationValid = destination.trim().length > 0;

      setIsFormValid(
        isDateValid && isTimeValid && isPickupValid && isDestinationValid
      );
    };

    validateForm();
  }, [date, time, pickup, destination]);

  // Handle date change with format validation
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      setDate(newDate);
    }
  };

  // Handle time change with format validation
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (/^\d{2}:\d{2}$/.test(newTime)) {
      setTime(newTime);
    }
  };

  const createRideMutation = useMutation({
    mutationFn: async (newRide: RideRequest) => {
      const response = await axios.post(
        "http://localhost:3001/api/v1/ride",
        newRide,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userRides"]);
      toast({
        title: "Ride requested successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error creating ride request",
        description: "Please verify all fields are correctly filled",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error creating ride request:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast({
        title: "Invalid form",
        description: "Please check all fields are filled correctly",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Validate date and time combination
      const scheduledDateTime = new Date(`${date}T${time}`);
      if (isNaN(scheduledDateTime.getTime())) {
        throw new Error("Invalid date or time");
      }

      const offset = -scheduledDateTime.getTimezoneOffset();
      const tzSign = offset >= 0 ? "+" : "-";
      const tzHours = String(Math.floor(Math.abs(offset) / 60)).padStart(
        2,
        "0"
      );
      const tzMinutes = String(Math.abs(offset) % 60).padStart(2, "0");
      const tzOffsetStr = `${tzSign}${tzHours}:${tzMinutes}`;

      const scheduledTime = `${date}T${time}${tzOffsetStr}`;

      const newRide: RideRequest = {
        pickup_location: pickup,
        destination_location: destination,
        scheduled_time: scheduledTime,
      };
      createRideMutation.mutate(newRide);
    } catch (error) {
      toast({
        title: "Invalid date/time",
        description: "Please check the date and time values",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md" textAlign="center">
            Request a Ride
          </Heading>
          <FormControl isRequired>
            <FormLabel>Pickup Location</FormLabel>
            <Input
              placeholder="Enter pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Destination</FormLabel>
            <Input
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={date}
              onChange={handleDateChange}
              min={initialDate}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Time</FormLabel>
            <Input type="time" value={time} onChange={handleTimeChange} />
          </FormControl>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button
          type="submit"
          bg={primaryColor}
          _hover={{ bg: "#15339E" }}
          color="white"
          isLoading={createRideMutation.isLoading}
          isDisabled={!isFormValid}
          mr={3}
        >
          Send Request
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </form>
  );
};

export default NewRideRequest;
