import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
} from '@chakra-ui/react';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'user' | 'driver'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, phoneNumber, role);
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again later.');
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
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <FormControl id="phoneNumber" isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </FormControl>
          <FormControl id="role" isRequired>
            <FormLabel>Role</FormLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'driver')}
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
            </Select>
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
          >
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default RegisterForm;

