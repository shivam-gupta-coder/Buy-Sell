import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { 
  Container, 
  Paper, 
  ButtonGroup, 
  Button, 
  Box,
  Typography
} from '@mui/material';
import { 
  Login as LoginIcon, 
  PersonAdd as RegisterIcon 
} from '@mui/icons-material';

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 4,
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            Welcome
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <ButtonGroup 
              variant="contained" 
              sx={{ 
                backgroundColor: 'background.paper',
                '& .MuiButton-root': {
                  px: 4,
                  py: 1
                }
              }}
            >
              <Button
                onClick={() => setIsLogin(true)}
                variant={isLogin ? 'contained' : 'outlined'}
                startIcon={<LoginIcon />}
                sx={{
                  borderColor: isLogin ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => setIsLogin(false)}
                variant={!isLogin ? 'contained' : 'outlined'}
                startIcon={<RegisterIcon />}
                sx={{
                  borderColor: !isLogin ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
              >
                Register
              </Button>
            </ButtonGroup>
          </Box>

          <Box 
            sx={{
              mt: 2,
              transition: 'all 0.3s ease',
              animation: 'fadeIn 0.3s ease-in'
            }}
          >
            {isLogin ? <Login /> : <Register />}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;