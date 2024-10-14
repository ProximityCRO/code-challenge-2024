import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import LoginForm from '../components/Auth/LoginForm';

const Login: React.FC = () => {
  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Welcome to GetARide
        </Heading>
        <Text textAlign="center">Please log in to continue</Text>
        <LoginForm />
      </VStack>
    </Box>
  );
};

export default Login;