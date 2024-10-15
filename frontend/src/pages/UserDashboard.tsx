import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Box h="100vh" maxWidth="600px" margin="auto" mt={8} p={4}>
      <Heading as="h1" size="xl">User Dashboard</Heading>
      <Text mt={4}>Welcome to Get A Ride!</Text>
      <Button mt={4} onClick={handleLogout} colorScheme="red">
        Logout
      </Button>
    </Box>
  );
};

export default UserDashboard;