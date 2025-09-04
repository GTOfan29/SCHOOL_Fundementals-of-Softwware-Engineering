import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Typography, Card, CardContent, Button, AppBar, Toolbar, IconButton, TextField, InputAdornment, Select, MenuItem, FormControl, SelectChangeEvent, Alert, Snackbar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addItem } from '../../store/slices/orderSlice';
import { RootState } from '../../store/store';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Drawer from '@mui/material/Drawer';
import Footer from '../../components/Footer';

interface MenuItem {
  item_id: string;
  name: string;
  description: string;
  price: string | number;  // PostgreSQL numeric type can come as string
  category: string;
}

interface ActiveOrder {
  item_id: number;
  quantity: number;
  status: string;
  notes?: string;
  table_num: number;
  name: string;
  created_at: string;
}

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderItems = useSelector((state: RootState) => state.order.items);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('tableNumber');
    setLogoutDialogOpen(false);
    navigate('/');
  };

  const fetchMenuItems = async (retry = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/menu/items');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMenuItems(data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map((item: MenuItem) => item.category))) as string[];
      setCategories(['all', ...uniqueCategories]);
      
      // Cache the menu items in localStorage with timestamp
      localStorage.setItem('menuItems', JSON.stringify({
        items: data,
        timestamp: new Date().getTime()
      }));
      
    } catch (error) {
      console.error('Error fetching menu items:', error);
      
      // Try to use cached data if available
      const cachedData = localStorage.getItem('menuItems');
      if (cachedData) {
        const { items, timestamp } = JSON.parse(cachedData);
        const age = new Date().getTime() - timestamp;
        
        // Use cached data if it's less than 1 hour old
        if (age < 3600000) {
          setMenuItems(items);
          const uniqueCategories = Array.from(new Set(items.map((item: MenuItem) => item.category))) as string[];
          setCategories(['all', ...uniqueCategories]);
          setError('Using cached menu data. Please check your connection.');
          return;
        }
      }
      
      setError('Failed to load menu items. Please try again.');
      
      // Implement retry logic with exponential backoff
      if (retry < 3) {
        setTimeout(() => {
          setRetryCount(retry + 1);
          fetchMenuItems(retry + 1);
        }, Math.pow(2, retry) * 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [retryCount]);

  const handleAddToOrder = (item: MenuItem) => {
    const tableNum = localStorage.getItem('tableNumber');
    if (!tableNum) {
      navigate('/');
      return;
    }

    dispatch(addItem({
      id: item.item_id,
      name: item.name,
      price: parseFloat(item.price.toString())  // Ensure we have a number
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = React.useMemo(() => {
    if (selectedCategory === 'all') {
      return categories
        .filter(cat => cat !== 'all')
        .reduce((acc, category) => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          if (categoryItems.length > 0) {
            acc[category] = categoryItems;
          }
          return acc;
        }, {} as Record<string, MenuItem[]>);
    } else {
      return {
        [selectedCategory]: filteredItems.filter(item => item.category === selectedCategory)
      };
    }
  }, [selectedCategory, filteredItems, categories]);

  // Function to generate image URL from item ID
  const getImageUrl = (itemId: string) => `/foodphoto_${itemId}.png`;

  // Add this helper function before the return statement
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <Box
          key={index}
          component="span"
          sx={{
            backgroundColor: 'rgba(45, 167, 192, 0.42)',
            //padding: '0 2px',
            borderRadius: '2px',
          }}
        >
          {part}
        </Box>
      ) : part
    );
  };

  // Aktif siparişleri çek
  const fetchActiveOrders = async () => {
    try {
      const tableNum = localStorage.getItem('tableNumber');
      if (!tableNum) return;

      const response = await fetch(`http://localhost:3001/api/orders/table/${tableNum}`);
      if (!response.ok) throw new Error('Siparişler alınamadı');

      const orders = await response.json();
      // Hazırlanıyor, bekliyor ve hazır durumundaki siparişleri filtrele
      const activeOrders = orders
        .filter((order: ActiveOrder) => 
          ['pending', 'preparing', 'ready'].includes(order.status.toLowerCase())
        )
        .sort((a: ActiveOrder, b: ActiveOrder) => {
          // Durumlara göre sıralama önceliği
          const statusPriority: { [key: string]: number } = {
            'ready': 1,
            'preparing': 2,
            'pending': 3
          };
          return statusPriority[a.status.toLowerCase()] - statusPriority[b.status.toLowerCase()];
        });
      setActiveOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching active orders:', error);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    // Her 30 saniyede bir aktif siparişleri güncelle
    const interval = setInterval(fetchActiveOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#F5E6D3'
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
              Grup28
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* View Tables & Reserve */}
            <Button
              color="inherit"
              onClick={() => alert("Masa rezervasyonu henüz işlenmemiştir.")}
              sx={{ color: '#F5E6D3' }}
            >
              Masalar & Rezervasyon
            </Button>

            {/* Payments */}
            <Button
              color="inherit"
              onClick={() => alert("Ödemeler henüz işlenmemiştir.")}
              sx={{ color: '#F5E6D3' }}
            >
              Ödemeler
            </Button>

            {/* Request Server */}
            <Button
              color="inherit"
              onClick={() => alert("Garson çağırma henüz işlenmemiştir.")}
              sx={{ color: '#F5E6D3' }}
            >
              Garson Çağır
            </Button>

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <IconButton 
                onClick={() => setIsOrdersDrawerOpen(true)}
                sx={{ 
                  color: '#F5E6D3',
                  '&:hover': { color: '#C85E3B' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    ({activeOrders.length})
                  </Typography>
                </Box>
              </IconButton>
            )}

            {/* Shopping Cart */}
            <IconButton 
              onClick={() => navigate('/order-review')}
              sx={{ 
                color: '#F5E6D3',
                '&:hover': { color: '#C85E3B' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCartIcon />
                {orderItems.length > 0 && (
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    ({orderItems.reduce((sum, item) => sum + item.quantity, 0)})
                  </Typography>
                )}
              </Box>
            </IconButton>

            {/* Logout */}
            <IconButton 
              onClick={handleLogout}
              sx={{ 
                color: '#F5E6D3',
                '&:hover': { color: '#C85E3B' }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ 
        padding: {
          xs: 2,
          sm: 3
        }, 
        paddingTop: {
          xs: '110px',
          sm: '130px'
        },
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            color: '#2C1810', 
            fontWeight: 'bold',
            mb: 3,
            fontSize: {
              xs: '1.4rem',
              sm: '1.6rem'
            }
          }}
        >
          Menü
        </Typography>
        
        {/* Search Bar and Category Dropdown */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          mb: 3,
          alignItems: 'flex-start'
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#2C1810',
                mb: 1,
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              Arama
            </Typography>
            <TextField
              placeholder="Menüde Ara..."
              size="medium"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#A64B2A', fontSize: '1.4rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  fontSize: '1rem',
                  '&.Mui-focused fieldset': {
                    borderColor: '#A64B2A',
                  },
                  '&:hover fieldset': {
                    borderColor: '#A64B2A',
                  },
                },
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: '#2C1810',
                mb: 1,
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              Kategori
            </Typography>
            <FormControl sx={{ minWidth: { xs: 120, sm: 140 } }}>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                size="medium"
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 1.5,
                  fontSize: '1rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#A64B2A',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#A64B2A',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#A64B2A',
                  },
                  '& .MuiSelect-select': {
                    color: '#2C1810',
                    padding: '10px 14px',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#FFFFFF',
                      borderRadius: 1.5,
                      mt: 1,
                      '& .MuiMenuItem-root': {
                        fontSize: '1rem',
                        padding: '8px 16px',
                        '&:hover': {
                          backgroundColor: 'rgba(166, 75, 42, 0.08)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(166, 75, 42, 0.12)',
                          '&:hover': {
                            backgroundColor: 'rgba(166, 75, 42, 0.18)',
                          }
                        }
                      }
                    }
                  }
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Menu Items Grid */}
        <Grid container spacing={2}>
          {Object.entries(groupedItems).map(([category, items]) => (
            <React.Fragment key={category}>
              {(selectedCategory === 'all' || items.length > 0) && (
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#2C1810',
                      fontWeight: 'bold',
                      mt: 1.5,
                      mb: 0.5,
                      borderBottom: '2px solid #A64B2A',
                      paddingBottom: 0.5,
                      fontSize: '1.1rem'
                    }}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Typography>
                </Grid>
              )}
              
              {/* Category Items */}
              {items.map(item => (
                <Grid item xs={12} key={item.item_id}>
                  <Card sx={{ 
                    backgroundColor: '#2C1810',
                    color: '#F5E6D3',
                    borderRadius: 1.5,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    },
                    display: 'flex',
                    flexDirection: 'row',
                    overflow: 'hidden'
                  }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        top:'10px',
                        flexShrink: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <Box
                        component="img"
                        src={getImageUrl(item.item_id)}
                        alt={item.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = "/food-placeholder.jpg";
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ p: 1.5, flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          color: '#F5E6D3', 
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          mb: 0.5
                        }}>
                          {highlightText(item.name, searchQuery)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#D4C3B3',
                          mb: 0.5,
                          fontSize: '0.875rem',
                          lineHeight: 1.4
                        }}>
                          {highlightText(item.description, searchQuery)}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 'auto'
                        }}>
                          <Typography variant="body1" sx={{ 
                            color: '#F5E6D3', 
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            ₺{Number(item.price).toFixed(2)}
                          </Typography>
                          <Button 
                            size="small"
                            variant="contained" 
                            sx={{ 
                              backgroundColor: '#A64B2A',
                              color: '#F5E6D3',
                              '&:hover': {
                                backgroundColor: '#C85E3B'
                              },
                              fontSize: '0.875rem',
                              py: 0.5,
                              px: 2,
                              minWidth: 'unset'
                            }}
                            onClick={() => handleAddToOrder(item)}
                          >
                            Sipariş Ver
                          </Button>
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </React.Fragment>
          ))}
        </Grid>
      </Box>
      
      {/* Order Summary */}
      {orderItems.length > 0 && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          bgcolor: '#2C1810', 
          p: 2.5, 
          boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
          color: '#F5E6D3',
          zIndex: 1000
        }}>
          <Box sx={{ 
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Typography variant="h6" sx={{ 
              color: '#F5E6D3', 
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              Siparişiniz ({orderItems.reduce((sum, item) => sum + item.quantity, 0)} ürün)
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              size="medium"
              sx={{ 
                mt: 1.5,
                backgroundColor: '#A64B2A',
                color: '#F5E6D3',
                '&:hover': {
                  backgroundColor: '#C85E3B'
                },
                fontSize: '1rem',
                py: 1
              }}
              onClick={() => navigate('/order-review')}
            >
              Siparişi Görüntüle
            </Button>
          </Box>
        </Box>
      )}

      <Footer />

      {/* Aktif Siparişler Drawer'ı */}
      <Drawer
        anchor="right"
        open={isOrdersDrawerOpen}
        onClose={() => setIsOrdersDrawerOpen(false)}
      >
        <Box sx={{ 
          width: 300, 
          p: 3, 
          backgroundColor: '#2C1810', 
          height: '100%',
          overflowY: 'auto'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#F5E6D3',
              fontWeight: 'bold',
              mb: 3
            }}
          >
            Aktif Siparişleriniz
          </Typography>

          {activeOrders.map((order) => {
            // Duruma göre renk ve stil belirleme
            const getStatusStyle = (status: string) => {
              switch (status.toLowerCase()) {
                case 'pending':
                  return {
                    color: '#FF9800',
                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
                    text: 'Beklemede'
                  };
                case 'preparing':
                  return {
                    color: '#2196F3',
                    bgcolor: 'rgba(33, 150, 243, 0.1)',
                    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
                    text: 'Hazırlanıyor'
                  };
                case 'ready':
                  return {
                    color: '#4CAF50',
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
                    text: 'Hazır'
                  };
                default:
                  return {
                    color: '#757575',
                    bgcolor: 'rgba(117, 117, 117, 0.1)',
                    icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />,
                    text: status
                  };
              }
            };

            const statusStyle = getStatusStyle(order.status);

            return (
              <Box
                key={`${order.item_id}-${order.table_num}-${order.created_at}`}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  borderLeft: `4px solid ${statusStyle.color}`
                }}
              >
                <Typography sx={{ color: '#2C1810', fontWeight: 'medium', mb: 1 }}>
                  {order.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  {order.quantity} adet
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    backgroundColor: statusStyle.bgcolor,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    width: 'fit-content'
                  }}
                >
                  {statusStyle.icon}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: statusStyle.color,
                      fontWeight: 'medium'
                    }}
                  >
                    {statusStyle.text}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ display: 'block', color: '#666', mt: 1 }}>
                  Oluşturulma Tarihi: {new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
                {order.notes && (
                  <Typography variant="body2" sx={{ color: '#666', mt: 1, fontStyle: 'italic' }}>
                    Not: {order.notes}
                  </Typography>
                )}
              </Box>
            );
          })}

          {activeOrders.length === 0 && (
            <Typography 
              sx={{ 
                color: '#F5E6D3',
                textAlign: 'center',
                mt: 2
              }}
            >
              Aktif siparişiniz bulunmuyor.
            </Typography>
          )}
        </Box>
      </Drawer>

      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#F5E6D3',
            borderRadius: 2,
            maxWidth: '90%',
            width: '400px'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#2C1810',
          fontWeight: 'bold',
          textAlign: 'center',
          pt: 3
        }}>
          Çıkış Yapmak İstediğinize Emin Misiniz?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ 
            color: '#2C1810',
            textAlign: 'center',
            mb: 2
          }}>
            Çıkış yaptığınızda masa oturumunuz sonlandırılacaktır.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center',
          pb: 3,
          px: 3,
          gap: 2
        }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            variant="outlined"
            sx={{
              color: '#2C1810',
              borderColor: '#2C1810',
              '&:hover': {
                borderColor: '#2C1810',
                backgroundColor: 'rgba(44, 24, 16, 0.04)'
              },
              flex: 1
            }}
          >
            İptal
          </Button>
          <Button
            onClick={confirmLogout}
            variant="contained"
            sx={{
              backgroundColor: '#A64B2A',
              color: '#F5E6D3',
              '&:hover': {
                backgroundColor: '#C85E3B'
              },
              flex: 1
            }}
          >
            Çıkış Yap
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuPage;