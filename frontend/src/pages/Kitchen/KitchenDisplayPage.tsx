import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  Alert, 
  Snackbar, 
  CircularProgress,
  Paper,
  Grid,
  IconButton,
  Divider
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DoneIcon from '@mui/icons-material/Done';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready';
  notes?: string;
  tableNumber: string;
  createdAt: string;
}

interface KitchenOrder {
  id: string;
  tableNumber: string;
  items: Omit<OrderItem, 'tableNumber' | 'createdAt'>[];
  status: 'pending' | 'preparing' | 'ready';
  createdAt: string;
}

const KitchenDisplayPage = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:3001/api/kitchen/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Siparişler alınamadı. Lütfen tekrar deneyin.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const updateItemStatus = async (orderId: string, itemId: string, tableNum: string, newStatus: 'pending' | 'preparing' | 'ready') => {
    try {
      const response = await fetch(`http://localhost:3001/api/kitchen/orders/${itemId}/${tableNum}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update local state first for immediate feedback
      setOrders(prev => 
        prev.map(order => ({
          ...order,
          items: order.items.map(item => 
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        }))
      );

      setSnackbar({
        open: true,
        message: 'Sipariş durumu başarıyla güncellendi',
        severity: 'success'
      });

      // Fetch fresh data after a short delay
      setTimeout(fetchOrders, 1000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setSnackbar({
        open: true,
        message: 'Sipariş durumu güncellenemedi',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'preparing': return '#2196f3';
      case 'ready': return '#4caf50';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AccessTimeIcon />;
      case 'preparing': return <LocalDiningIcon />;
      case 'ready': return <DoneIcon />;
      default: return null;
    }
  };

  const getAllItems = () => {
    const items: OrderItem[] = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        items.push({
          ...item,
          tableNumber: order.tableNumber,
          createdAt: order.createdAt
        });
      });
    });
    return items;
  };

  const filteredItems = getAllItems().filter(item => item.status === activeTab);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const itemsByStatus = {
    pending: getAllItems().filter(item => item.status === 'pending'),
    preparing: getAllItems().filter(item => item.status === 'preparing'),
    ready: getAllItems().filter(item => item.status === 'ready')
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      p: { xs: 2, md: 4 }
    }}>
      {/* Header */}
      <Paper elevation={0} sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: '#1a237e',
        color: 'white',
        borderRadius: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RestaurantIcon sx={{ fontSize: 40 }} />
          <Typography variant="h4" fontWeight="bold">
            KOS 0.1
          </Typography>
        </Box>
      </Paper>

      {/* Status Tabs */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {(['pending', 'preparing', 'ready'] as const).map((status) => (
          <Grid item xs={12} md={4} key={status}>
            <Paper
              elevation={activeTab === status ? 3 : 1}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: activeTab === status ? getStatusColor(status) : 'white',
                color: activeTab === status ? 'white' : 'inherit',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
              onClick={() => setActiveTab(status)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(status)}
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {status === 'pending' ? 'Bekleyen' : 
                     status === 'preparing' ? 'Hazırlanan' : 
                     'Hazır'}
                  </Typography>
                </Box>
                <Chip 
                  label={itemsByStatus[status].length}
                  sx={{ 
                    backgroundColor: activeTab === status ? 'rgba(255,255,255,0.2)' : getStatusColor(status),
                    color: activeTab === status ? 'white' : 'white'
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Items Grid */}
      <Grid container spacing={3}>
        {filteredItems.map(item => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`${item.id}-${item.tableNumber}`}>
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <Box sx={{ 
                p: 2, 
                backgroundColor: getStatusColor(item.status),
                color: 'white'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Masa {item.tableNumber}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {item.quantity}x {item.name}
                  </Typography>
                  {item.notes && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      Not: {item.notes}
                    </Typography>
                  )}
                </Box>
                    
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {item.status === 'pending' && (
                    <Button 
                      variant="contained"
                      size="small" 
                      sx={{ 
                        backgroundColor: getStatusColor('preparing'),
                        '&:hover': { backgroundColor: '#1976d2' }
                      }}
                      onClick={() => updateItemStatus(item.tableNumber, item.id, item.tableNumber, 'preparing')}
                    >
                      Hazırlamaya Başla
                    </Button>
                  )}
                  {item.status === 'preparing' && (
                    <Button 
                      variant="contained"
                      size="small" 
                      sx={{ 
                        backgroundColor: getStatusColor('ready'),
                        '&:hover': { backgroundColor: '#388e3c' }
                      }}
                      onClick={() => updateItemStatus(item.tableNumber, item.id, item.tableNumber, 'ready')}
                    >
                      Tamamlandı olarak işaretle
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KitchenDisplayPage;
