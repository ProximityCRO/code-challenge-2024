import React from 'react';
import { Box, Heading, Button, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <VStack spacing={4}>
        <Heading as="h1" size="xl">Welcome to GetARide</Heading>
        <Button as={Link} to="/login" colorScheme="blue">Login</Button>
        <Button as={Link} to="/register" colorScheme="green">Register</Button>
      </VStack>
    </Box>
  );
};

export default Home;