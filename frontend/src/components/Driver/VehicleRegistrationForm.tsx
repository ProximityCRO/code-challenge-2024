import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const VehicleRegistrationForm: React.FC = () => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log(`${user?.id} ${brand} ${model} ${year} ${color}`);
      
      const response = await axios.post('http://localhost:3001/api/v1/vehicle', {
        driver_id: user?.id,
        brand,
        model,
        year: parseInt(year),
        color,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast({
        title: 'Vehicle registered successfully',
        description: `Your ${color} ${brand} ${model} has been registered.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Store vehicle information in local storage
      localStorage.setItem('userVehicle', JSON.stringify(response.data));

      navigate('/driver-dashboard');
    } catch (error) {
      console.error('Vehicle registration failed:', error);
      let errorMessage = 'Please try again';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast({
        title: 'Vehicle registration failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        Register Your Vehicle
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="brand" isRequired>
            <FormLabel>Brand</FormLabel>
            <Input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Toyota"
            />
          </FormControl>
          <FormControl id="model" isRequired>
            <FormLabel>Model</FormLabel>
            <Input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., Corolla"
            />
          </FormControl>
          <FormControl id="year" isRequired>
            <FormLabel>Year</FormLabel>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2022"
            />
          </FormControl>
          <FormControl id="color" isRequired>
            <FormLabel>Color</FormLabel>
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., White"
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
          >
            Register Vehicle
          </Button>
        </VStack>
      </form>
      <Text mt={4} fontSize="sm" color="gray.600">
        Note: You can edit your vehicle information later in your profile settings.
      </Text>
    </Box>
  );
};

export default VehicleRegistrationForm;