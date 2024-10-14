import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import LoginForm from "../components/Auth/LoginForm";

const Login: React.FC = () => {
  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <VStack spacing={4} align="center">
        <Heading as="h1" color="#1F41BB" fontWeight="bold">
          Login Here
        </Heading>
        <Text color="black" fontWeight={500}>
          Welcome back you've been missed!
        </Text>
        <LoginForm />
      </VStack>
    </Box>
  );
};

export default Login;
