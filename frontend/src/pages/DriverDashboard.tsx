import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <Heading as="h1" size="xl">Driver Dashboard</Heading>
      <Text mt={4}>Welcome, {user?.name || 'Driver'}!</Text>
    </Box>
  );
};

export default DriverDashboard;