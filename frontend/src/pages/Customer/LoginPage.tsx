import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';

const LoginPage = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (tableNumber && pin) {
      // In a real app, you would verify with backend
      localStorage.setItem('tableNumber', tableNumber);
      navigate('/menu');
    } else {
      setError('Lütfen masa numarası ve PIN giriniz');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#000000',
      gap: 2,
      padding: 1,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1
        }}
      />
      <Box sx={{
        position: 'absolute',
        top: {
          xs: '10%',  // Smaller top margin on mobile
          sm: '5%'   // Original top margin on larger screens
        },
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2
      }}>
        <Box
          component="img"
          src="/gesture.png" 
          alt="Login Icon"
          sx={{
            width: {
              xs: '100px',
              sm: '120px'
            },
            height: {
              xs: '100px',
              sm: '120px'
            },
            objectFit: 'contain'
          }}
        />
      </Box>
      <Box sx={{
        position: 'absolute',
        top: {
          xs: '25%',  // More space from icon on mobile
          sm: '20%'   // Original position on larger screens
        },
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.58)',
        padding: '15px',
        zIndex: 110
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          color: '#EFEFEF',
          zIndex: 111,
          width: '100%',
          textAlign: 'center'
        }}>
          HOŞGELDİNİZ 
        </Typography>
      </Box>
      <Box sx={{
        backgroundColor: 'rgba(134, 134, 134, 0.17)',
        padding: 4,
        borderRadius: '30px 30px 0 0',
        width: '100%',
        position: 'absolute',
        top: '45%',
        left: 0,
        right: 0,
        height: '55%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center'
      }}>
        <Box sx={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Masa Numarası"
            variant="outlined"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            fullWidth
            sx={{ 
              borderRadius: 2, 
              backgroundColor: '#EAE4D5',
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#ec8028'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#ec8028'
              }
            }}
          />
          <TextField
            label="PIN"
            type="password"
            variant="outlined"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            fullWidth
            sx={{ 
              borderRadius: 2, 
              backgroundColor: '#EAE4D5',
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#ec8028'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#ec8028'
              }
            }}
          />
          {error && (
            <Typography 
              color="error" 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                textAlign: 'center',
                width: '100%'
              }}
            >
              {error}
            </Typography>
          )}
          <Button 
            variant="contained" 
            onClick={handleLogin}
            fullWidth
            size="large"
            sx={{ 
              borderRadius: '20px', 
              backgroundColor: '#2e7d32',  
              '&:hover': { 
                backgroundColor: '#1b5e20',
                transform: 'scale(1.02)',
                transition: 'all 0.2s ease-in-out'
              },
              '&:active': { 
                backgroundColor: '#1b5e20',
                transform: 'scale(0.98)'
              },
              fontWeight: 'bold',
              fontSize: '1.1rem',
              padding: '12px'
            }}
          >
            Siparişe Başla
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;