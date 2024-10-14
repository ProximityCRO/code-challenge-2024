import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Alert,
  AlertIcon,
  Heading,
  Text,
} from "@chakra-ui/react";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      // Redirect to dashboard based on user role
      navigate("/user-dashboard");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxWidth="400px" margin="auto">
      <VStack spacing={6} align="stretch">
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
            <FormControl id="email" isRequired>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderRadius="10px"
                background="#F1F4FF"
                placeholder="Email"
                fontWeight={500}
                _placeholder={{ color: "#626262" }}
                _focus={{ outline: "none", boxShadow: "0 0 0 2px #1F41BB" }}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderRadius="10px"
                background="#F1F4FF"
                placeholder="Password"
                fontWeight={500}
                _placeholder={{ color: "#626262" }}
                _focus={{ outline: "none", boxShadow: "0 0 0 2px #1F41BB" }}
              />
            </FormControl>
            <Button
              type="submit"
              width="full"
              isLoading={isLoading}
              borderRadius="10px"
              background="#1F41BB"
              boxShadow="0px 10px 20px 0px #CBD6FF"
              color="white"
              _hover={{ background: "#1A38A3" }}
            >
              Sign In
            </Button>
            <Button
              as={Link}
              to="/register"
              width="full"
              mt={2}
              background="#FFFFFF"
              color="#494949"
              fontWeight={600}
              _hover={{ background: "#F1F4FF" }}
            >
              Create an Account
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default LoginForm;
