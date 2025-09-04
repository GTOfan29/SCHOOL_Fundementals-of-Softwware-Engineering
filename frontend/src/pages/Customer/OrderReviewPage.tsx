import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, List as MUIList, ListItem, IconButton, TextField, AppBar, Toolbar, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { RootState } from '../../store/store';
import { updateQuantity, removeItem, setNote, submitOrder, clearOrder } from '../../store/slices/orderSlice';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const OrderReviewPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, note } = useSelector((state: RootState) => state.order);
  const [error, setError] = useState<string | null>(null);
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [removeConfirmDialog, setRemoveConfirmDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null);

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        dispatch(updateQuantity({ id, quantity: newQuantity }));
      } else if (newQuantity === 0) {
        setItemToRemove({ id, name: item.name });
        setRemoveConfirmDialog(true);
      }
    }
  };

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      dispatch(removeItem(itemToRemove.id));
      setRemoveConfirmDialog(false);
      setItemToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setRemoveConfirmDialog(false);
    setItemToRemove(null);
  };

  const handleSubmitOrder = async () => {
    setConfirmDialog(false);
    try {
      const tableNum = localStorage.getItem('tableNumber');
      if (!tableNum) {
        setError('Masa numarası bulunamadı. Lütfen tekrar giriş yapın.');
        navigate('/');
        return;
      }

      // API çağrısı yapılıyor
      const response = await fetch('http://localhost:3001/api/orders/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: parseInt(tableNum),
          items: items.map(item => ({
            itemId: item.id,
            quantity: item.quantity,
          })),
          note: note
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch(submitOrder());
        dispatch(clearOrder());
        navigate('/order-status');
      } else {
        throw new Error(data.error || 'Sipariş gönderilirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(false);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tipAmount = (totalAmount * tipPercentage) / 100;
  const finalAmount = totalAmount + tipAmount;

  return (
    <Box sx={{ 
      backgroundColor: '#F5E6D3',
      minHeight: '100vh',
      maxWidth: '100%',
      margin: '0 auto'
    }}>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

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
          <IconButton 
            onClick={() => navigate('/menu')}
            sx={{ 
              color: '#F5E6D3',
              '&:hover': { color: '#C85E3B' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        padding: { xs: 2, sm: 3 }, 
        paddingTop: { xs: '80px', sm: '100px' },
        maxWidth: 800,
        mx: 'auto'
      }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            color: '#2C1810',
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Siparişinizi İnceleyin
        </Typography>

        {items.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'rgb(250, 241, 221)',
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#2C1810',
                mb: 2
              }}
            >
              Sepetiniz Boş
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#666',
                mb: 4
              }}
            >
              Menüden ürün ekleyerek siparişinizi oluşturabilirsiniz.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/menu')}
              sx={{
                backgroundColor: '#C85E3B',
                color: '#F5E6D3',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#A34B2F'
                }
              }}
            >
              Menüye Dön
            </Button>
          </Box>
        ) : (
          <>
            <MUIList>
              {items.map(item => (
                <ListItem
                  key={item.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    p: 2,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  <Box>
                    <Typography 
                      variant="h6"
                      sx={{ 
                        color: '#2C1810',
                        fontWeight: 'medium'
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: '#C85E3B' }}
                    >
                      Her biri ₺{item.price.toFixed(2)} 
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      sx={{ 
                        color: '#2C1810',
                        '&:hover': { 
                          color: '#C85E3B',
                          backgroundColor: 'rgba(200, 94, 59, 0.1)'
                        }
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ color: '#2C1810', minWidth: '24px', textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      sx={{ 
                        color: '#2C1810',
                        '&:hover': { 
                          color: '#C85E3B',
                          backgroundColor: 'rgba(200, 94, 59, 0.1)'
                        }
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </MUIList>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Özel İstekler"
              value={note}
              onChange={(e) => dispatch(setNote(e.target.value))}
              sx={{ 
                my: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFFFFF',
                  '&:hover fieldset': {
                    borderColor: '#C85E3B',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#C85E3B',
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#C85E3B'
                }
              }}
            />

            {items.length > 0 && (
              <>
                {/* Tip Selection */}
                <Box sx={{ mt: 4, p: 2, bgcolor: '#FFFFFF', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Typography variant="h6" gutterBottom>
                    Bahşiş Tutarı
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    {[0, 10, 15, 20].map((percentage) => (
                      <Button
                        key={percentage}
                        variant={tipPercentage === percentage ? "contained" : "outlined"}
                        onClick={() => setTipPercentage(percentage)}
                        sx={{ minWidth: '80px' }}
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      Ara Toplam: ₺{totalAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="subtitle1">
                      Bahşiş: ₺{tipAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Toplam: ₺{finalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Payment Method */}
                <Box sx={{ mt: 4, p: 2, bgcolor: '#FFFFFF', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <Typography variant="h6" gutterBottom>
                    Ödeme Yöntemi
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => alert("Uygulama üzerinden ödeme özelliği henüz uygulanmadı.")}
                    sx={{ mb: 2 }}
                  >
                    Uygulama ile Öde
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                  >
                    Masada Öde
                  </Button>
                </Box>

                {/* Submit Order Button */}
                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleOpenConfirmDialog}
                    sx={{
                      backgroundColor: '#C85E3B',
                      color: '#F5E6D3',
                      py: 2,
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#A34B2F'
                      }
                    }}
                  >
                    Siparişi Gönder
                  </Button>
                </Box>
              </>
            )}
          </>
        )}
      </Box>

      {/* Remove Item Confirmation Dialog */}
      <Dialog
        open={removeConfirmDialog}
        onClose={handleCancelRemove}
        PaperProps={{
          sx: {
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            maxWidth: '400px',
            width: '90%'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#2C1810',
          fontWeight: 'bold',
          pb: 1
        }}>
          Ürünü Kaldır
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#2C1810' }}>
            {itemToRemove?.name} ürününü sepetten kaldırmak istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleCancelRemove}
            sx={{ 
              color: '#2C1810',
              '&:hover': {
                backgroundColor: 'rgba(44, 24, 16, 0.08)'
              }
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRemove}
            sx={{
              backgroundColor: '#A64B2A',
              color: '#F5E6D3',
              '&:hover': {
                backgroundColor: '#C85E3B'
              }
            }}
          >
            Kaldır
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: {
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            maxWidth: '400px',
            width: '90%'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#2C1810',
          fontWeight: 'bold',
          pb: 1
        }}>
          Sipariş Onayı
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#2C1810' }}>
            Siparişinizi onaylıyor musunuz?
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            Toplam Tutar: ₺{finalAmount.toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            {items.reduce((total, item) => total + item.quantity, 0)} adet ürün ({items.length} çeşit)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleCloseConfirmDialog}
            sx={{ 
              color: '#2C1810',
              '&:hover': {
                backgroundColor: 'rgba(44, 24, 16, 0.08)'
              }
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitOrder}
            sx={{
              backgroundColor: '#A64B2A',
              color: '#F5E6D3',
              '&:hover': {
                backgroundColor: '#C85E3B'
              }
            }}
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderReviewPage; 