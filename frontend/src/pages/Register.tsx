import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import RegisterForm from "../components/Auth/RegisterForm";

const Register: React.FC = () => {
  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <VStack spacing={4} align="center">
        <Heading as="h1" color="#1F41BB" fontWeight="bold">
          Create Account
        </Heading>
        <Text color="black" fontWeight={500}>
          Create an account so you can begin requesting your rides
        </Text>
        <RegisterForm />
      </VStack>
    </Box>
  );
};

export default Register;
