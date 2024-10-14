import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <Heading as="h1" size="xl">User Dashboard</Heading>
      <Text mt={4}>Welcome, {user?.name || 'User'}!</Text>
    </Box>
  );
};

export default UserDashboard;