import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import RegisterForm from '../components/Auth/RegisterForm';

const Register: React.FC = () => {
  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Welcome to GetARide
        </Heading>
        <RegisterForm />
      </VStack>
    </Box>
  );
};

export default Register;