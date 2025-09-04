import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  CircularProgress
} from '@mui/material';
import TableLayout from '../../components/TableLayout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Table {
  id: number;
  number: number;
  seats: number;
  status: 'müsait' | 'dolu' | 'rezerve';
  serverId?: string;
  serverName?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  status: string;
  notes?: string;
  createdAt: string;
}

interface TableOrder {
  tableNumber: string;
  items: OrderItem[];
}

const ServerPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tables, setTables] = useState<Table[]>([
    { id: 1, number: 1, seats: 2, status: 'müsait' },
    { id: 2, number: 2, seats: 2, status: 'dolu' },
    { id: 3, number: 3, seats: 4, status: 'rezerve' },
    { id: 4, number: 4, seats: 4, status: 'müsait' },
    { id: 5, number: 5, seats: 6, status: 'dolu' },
    { id: 6, number: 6, seats: 6, status: 'müsait' },
    { id: 7, number: 7, seats: 8, status: 'rezerve' },
    { id: 8, number: 8, seats: 8, status: 'müsait' },
  ]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [readyOrders, setReadyOrders] = useState<TableOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/server/ready-orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setReadyOrders(data);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyOrders();
    const interval = setInterval(fetchReadyOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCompleteOrder = async (itemId: string, tableNum: string, createdAt: string) => {
    try {
      const formattedDate = new Date(createdAt).toISOString().replace('T', ' ').replace('Z', '');
      
      const response = await fetch(`http://localhost:3001/api/server/complete-order/${itemId}/${tableNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          created_at: formattedDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sipariş tamamlanamadı');
      }

      // Update local state
      setReadyOrders(prev => {
        const newTables = prev.map(table => {
          if (table.tableNumber === tableNum) {
            return {
              ...table,
              items: table.items.filter(item => item.id !== itemId)
            };
          }
          return table;
        });
        // Remove tables with no items
        return newTables.filter(table => table.items.length > 0);
      });

      setSnackbar({
        open: true,
        message: 'Sipariş tamamlandı olarak işaretlendi',
        severity: 'success'
      });

      // Refresh orders to ensure consistency
      fetchReadyOrders();
    } catch (err) {
      console.error('Siparişi tamamlamada hata oluştu:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Sipariş tamamlanamadı',
        severity: 'error'
      });
    }
  };

  const handleTableClick = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setSelectedTable(table);
      setIsDetailsOpen(true);
    }
  };

  const handleAssignServer = (tableId: number) => {
    alert("Garson atama özelliği henüz uygulanmadı.");
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedTable(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      p: { xs: 2, md: 4 }
    }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: '#1a237e',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          KASA
        </Typography>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: '#1a237e',
              '&.Mui-selected': {
                color: '#2196f3',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2196f3',
            }
          }}
        >
          <Tab label="Masa Düzeni" />
          <Tab label="Hazır Siparişler" />
        </Tabs>
      </Paper>

      {/* Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <TableLayout
            tables={tables}
            onTableClick={handleTableClick}
            onAssignServer={handleAssignServer}
          />
        </Paper>
      )}

      {activeTab === 1 && (
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : readyOrders.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Şu anda hazır sipariş bulunmuyor
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {readyOrders.map((table) => (
                <Grid item xs={12} md={6} lg={4} key={table.tableNumber}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: '#4caf50',
                      color: 'white'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Masa {table.tableNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2 }}>
                      {table.items.map((item) => (
                        <Box 
                          key={item.id}
                          sx={{ 
                            mb: 2,
                            p: 2,
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            borderRadius: 1,
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontWeight: 'medium' }}>
                              {item.quantity}x {item.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon fontSize="small" />
                              <Typography variant="body2">
                                {new Date(item.createdAt).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          </Box>

                          {item.notes && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 2 }}>
                              Not: {item.notes}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleCompleteOrder(item.id, table.tableNumber, item.createdAt)}
                              sx={{
                                backgroundColor: '#4caf50',
                                '&:hover': { backgroundColor: '#388e3c' }
                              }}
                            >
                              Servis Edildi olarak işaretle
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Table Details Dialog */}
      <Dialog 
        open={isDetailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#1a237e', color: 'white' }}>
          Masa {selectedTable?.number} Detayları
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedTable && (
            <>
              <Typography variant="h6" gutterBottom>
                Durum: {selectedTable.status === 'müsait' ? 'Müsait' : 
                        selectedTable.status === 'dolu' ? 'Dolu' : 
                        'Rezerve'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Koltuk: {selectedTable.seats}
              </Typography>
              {selectedTable.serverName && (
                <Typography variant="body1" gutterBottom>
                  Atanan Garson: {selectedTable.serverName}
                </Typography>
              )}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  İşlemler:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#2196f3',
                      '&:hover': { backgroundColor: '#1976d2' }
                    }}
                    onClick={() => alert("Siparişleri Görüntüleme özelliği henüz yapılmamıştır.")}
                  >
                    Siparişleri Görüntüle
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      color: '#2196f3',
                      borderColor: '#2196f3',
                      '&:hover': {
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)'
                      }
                    }}
                    onClick={() => alert("Durumu Değiştir özelliği henüz yapılmamıştır.")}
                  >
                    Durumu Değiştir
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServerPage; 