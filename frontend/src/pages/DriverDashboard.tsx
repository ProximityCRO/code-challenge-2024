import React from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const DriverDashboard: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <Heading as="h1" size="xl">Driver Dashboard</Heading>
      <Text mt={4}>Welcome to Get A Ride!</Text>
      <Button mt={4} onClick={handleLogout} colorScheme="red">Logout</Button>
    </Box>
  );
};

export default DriverDashboard;