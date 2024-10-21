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
  Select,
} from "@chakra-ui/react";

const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"user" | "driver">("user");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(name, email, password, phoneNumber, role);
      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxWidth="400px" margin="auto">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <FormControl id="name" isRequired>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              padding={5}
              borderRadius="10px"
              background="#F1F4FF"
              placeholder="Name"
              fontWeight={500}
              _placeholder={{ color: "#626262" }}
              _focus={{ outline: "none", boxShadow: "0 0 0 2px #1F41BB" }}
            />
          </FormControl>
          <FormControl id="email" isRequired>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              padding={5}
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
              padding={5}
              borderRadius="10px"
              background="#F1F4FF"
              placeholder="Password"
              fontWeight={500}
              _placeholder={{ color: "#626262" }}
              _focus={{ outline: "none", boxShadow: "0 0 0 2px #1F41BB" }}
            />
          </FormControl>
          <FormControl id="phoneNumber" isRequired>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              padding={5}
              borderRadius="10px"
              background="#F1F4FF"
              placeholder="Phone Number"
              fontWeight={500}
              _placeholder={{ color: "#626262" }}
              _focus={{ outline: "none", boxShadow: "0 0 0 2px #1F41BB" }}
            />
          </FormControl>
          <FormControl id="role" isRequired>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "driver")}
              borderRadius="10px"
              background="#F1F4FF"
              fontWeight={500}
              _focus={{ outline: "none", boxShadow: "0 0 0 2px #1F41BB" }}
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
            </Select>
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
            Register
          </Button>

          <Button
              as={Link}
              to="/login"
              width="full"
              mt={2}
              background="#FFFFFF"
              color="#494949"
              fontWeight={600}
              _hover={{ background: "#F1F4FF" }}
            >
              I already have an account
            </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default RegisterForm;
