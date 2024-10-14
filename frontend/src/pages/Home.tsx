import React from "react";
import { Box, Heading, Button, VStack, Text, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <Box maxWidth="600px" margin="auto" mt={8} p={4}>
      <VStack spacing={4}>
        <Box w={300} mb={4}>
          <img
            src="/get-a-ride-logo.png"
            alt="GetARide Logo"
            width="100%"
            height="100%"
          />
        </Box>
        <Heading as="h1" size="xl" color="#1F41BB">
          Connecting users with drivers
        </Heading>
        <Text color="black">
          Request your ride and receive the best bid from available drivers
        </Text>
        <HStack spacing={4}>
          <Button
            as={Link}
            to="/login"
            colorScheme="blue"
            borderRadius="10px"
            minW={120}
            minH={'30px'}
            bg="#1F41BB"
            boxShadow="0px 10px 20px 0px #CBD6FF"
            _hover={{ background: "#1A38A3" }}
          >
            Login
          </Button>
          <Button
            as={Link}
            to="/register"
            colorScheme="white"
            color="black"
            minW={120}
            minH={'30px'}
            fontWeight="bold"
          >
            Register
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Home;
