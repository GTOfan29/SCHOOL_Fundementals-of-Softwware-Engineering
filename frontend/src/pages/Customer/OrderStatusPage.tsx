import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { RootState } from '../../store/store';
import { clearOrder, clearCompletedOrder } from '../../store/slices/orderSlice';

const OrderStatusPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const completedOrder = useSelector((state: RootState) => state.order.completedOrder);
  const tableNumber = localStorage.getItem('tableNumber');

  // Eğer tamamlanmış sipariş yoksa menüye yönlendir
  useEffect(() => {
    if (completedOrder.items.length === 0) {
      navigate('/menu');
    }
  }, [completedOrder.items.length, navigate]);

  const handleNewOrder = () => {
    dispatch(clearOrder());
    dispatch(clearCompletedOrder());
    navigate('/menu');
  };

  if (completedOrder.items.length === 0) {
    return null; // Yönlendirme yapılırken boş sayfa göster
  }

  return (
    <Box sx={{ 
      backgroundColor: '#F5E6D3',
      minHeight: '100vh',
      maxWidth: '100%',
      margin: '0 auto'
    }}>
      <AppBar position="fixed" sx={{ backgroundColor: '#2C1810' }}>
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          px: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RestaurantMenuIcon sx={{ mr: 1, color: '#F5E6D3' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#F5E6D3', 
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Restaurant Name
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        padding: { xs: 2, sm: 3 }, 
        paddingTop: { xs: '80px', sm: '100px' },
        maxWidth: 800,
        mx: 'auto'
      }}>
        <Box sx={{
          textAlign: 'center',
          py: 6,
          backgroundColor: 'rgb(250, 241, 221)',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#2C1810',
              fontWeight: 'bold',
              mb: 3
            }}
          >
            Siparişiniz Alındı!
          </Typography>

          <Typography 
            variant="h6" 
            sx={{ 
              color: '#2C1810',
              mb: 2
            }}
          >
            Masa No: {tableNumber}
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666',
              mb: 4
            }}
          >
            Siparişiniz hazırlanıyor. Lütfen bekleyiniz.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, mx: 'auto' }}>
            <Button
              variant="contained"
              onClick={handleNewOrder}
              sx={{
                backgroundColor: '#C85E3B',
                color: '#F5E6D3',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#A34B2F'
                }
              }}
            >
              Yeni Sipariş Ver
            </Button>
          </Box>
        </Box>

        {/* Sipariş Detayları */}
        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#2C1810',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Sipariş Detayları
          </Typography>
          
          {completedOrder.items.map((item, index) => (
            <Box 
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                p: 2,
                mb: 1,
                borderRadius: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <Box>
                <Typography sx={{ color: '#2C1810', fontWeight: 'medium' }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {item.quantity} adet
                </Typography>
              </Box>
              <Typography sx={{ color: '#C85E3B', fontWeight: 'bold' }}>
                ₺{(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}

          {completedOrder.note && (
            <Box 
              sx={{
                backgroundColor: '#FFFFFF',
                p: 2,
                my: 2,
                borderRadius: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#2C1810',
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                Sipariş Notu:
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {completedOrder.note}
              </Typography>
            </Box>
          )}

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
            pt: 2,
            borderTop: '2px solid #2C1810'
          }}>
            <Typography variant="h6" sx={{ color: '#2C1810', fontWeight: 'bold' }}>
              Toplam
            </Typography>
            <Typography variant="h6" sx={{ color: '#C85E3B', fontWeight: 'bold' }}>
              ₺{completedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderStatusPage; 