import { useState } from "react";
import {
  Box, Container, Card, CardContent, Typography, FormControl,
  TextField, FormHelperText, CardActions, Button, Stack
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { VALIDATE_USER } from "../api"
import expense_logo from "../logo/expense_logo.png";
import "./Login.css";

// Destructuring the props
export default function Login({ setIsAuthenticated, setUserId, setUserName }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin@123");
  // Setting initial state of error as false
  const [errors, setErrors] = useState({ email: false, password: false });
  const navigate = useNavigate();
  
  // Function to handle login button
  const handleLoginClick = async () => {
    // Validate input fields and set errors if fields are empty
    setErrors({ email: !email, password: !password })

    // if both email and password are provided then make network call to validate user
    if (email && password) {

      try {
        const response = await fetch(VALIDATE_USER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          // Setting user id and name to the parent component
          setIsAuthenticated(true);
          setUserId(data.user._id);
          setUserName(data.user.name)
          navigate("/dashboard");

        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("An error occurred. Please try again later.");
      }
    }
  }

  return (
    <Box className="login-container">
      <Container maxWidth="xs">
        <Card className="login-card">
          <CardContent>
            <Stack direction="column" spacing={2} alignItems="center">
              <Box className="logo-container">
                <img
                  src={expense_logo}
                  alt="Expense Logo"
                  className="logo-image"
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                Welcome
              </Typography>
              <FormControl fullWidth error={errors.email}>
                <TextField fullWidth id="email" label="Email ID" type="email" variant="outlined" value={email} onChange={(event) => { setEmail(event.target.value) }} />
                {errors.email && <FormHelperText>Email is required.</FormHelperText>}
              </FormControl>
              <FormControl fullWidth error={errors.password}>
                <TextField fullWidth id="password" label="Password" type="password" value={password} onChange={(event) => { setPassword(event.target.value) }} variant="outlined" />
                {errors.password && <FormHelperText>Password is required.</FormHelperText>}
              </FormControl>
            </Stack>
          </CardContent>

          <CardActions className="card-actions">
            <Button variant="contained" color="primary" onClick={handleLoginClick}>
              Login
            </Button>
          </CardActions>
        </Card>
      </Container>
    </Box>
  );
}
