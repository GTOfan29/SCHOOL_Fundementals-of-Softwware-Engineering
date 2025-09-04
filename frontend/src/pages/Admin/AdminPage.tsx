import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Restaurant as MenuIcon,
  People as StaffIcon,
  TableBar as TableIcon,
  Inventory as InventoryIcon,
  Assessment as ReportsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const AdminPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFeatureClick = (featureName: string) => {
    setErrorMessage(`${featureName} özelliği henüz eklenmedi.`);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Paper sx={{ width: 240, p: 2, borderRadius: 0 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Yönetici Paneli
        </Typography>
        <List>
          <ListItem button onClick={() => handleFeatureClick('Menü Yönetimi')}>
            <ListItemIcon>
              <MenuIcon />
            </ListItemIcon>
            <ListItemText primary="Menü Yönetimi" />
          </ListItem>
          <ListItem button onClick={() => handleFeatureClick('Personel Yönetimi')}>
            <ListItemIcon>
              <StaffIcon />
            </ListItemIcon>
            <ListItemText primary="Personel Yönetimi" />
          </ListItem>
          <ListItem button onClick={() => handleFeatureClick('Masa Yönetimi')}>
            <ListItemIcon>
              <TableIcon />
            </ListItemIcon>
            <ListItemText primary="Masa Yönetimi" />
          </ListItem>
          <ListItem button onClick={() => handleFeatureClick('Stok Takibi')}>
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Stok Takibi" />
          </ListItem>
          <ListItem button onClick={() => handleFeatureClick('Raporlar')}>
            <ListItemIcon>
              <ReportsIcon />
            </ListItemIcon>
            <ListItemText primary="Raporlar" />
          </ListItem>
          <ListItem button onClick={() => handleFeatureClick('Güvenlik')}>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText primary="Güvenlik" />
          </ListItem>
        </List>
      </Paper>

      {/* Error Message Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorMessage(null)} 
          severity="warning" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Restoran Yönetim Sistemi
        </Typography>
        <Grid container spacing={3}>
          {/* Menu Management */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Menü Yönetimi
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Menü öğelerini ekleme, düzenleme ve silme işlevleri henüz uygulanmadı.
              </Alert>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Uygulanacak özellikler:
                • Menü öğesi ekleme/düzenleme/silme
                • Kategori yönetimi
                • Fiyat güncellemeleri
                • Özel menü öğeleri
                • Menü erişilebilirlik kontrolü
              </Typography>
            </Paper>
          </Grid>

          {/* Staff Management */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Personel Yönetimi
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Personel yönetimi işlevleri henüz uygulanmadı.
              </Alert>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Uygulanacak özellikler:
                • Personel vardiya planlaması
                • Rol yönetimi
                • Performans takibi
                • Erişim kontrolü
              </Typography>
            </Paper>
          </Grid>

          {/* Table Management */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Masa Yönetimi
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Masa yönetimi işlevleri henüz uygulanmadı.
              </Alert>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Uygulanacak özellikler:
                • Masa düzeni yapılandırması
                • Rezervasyon yönetimi
                • Masa durumu izleme
                • Garson atamaları
              </Typography>
            </Paper>
          </Grid>

          {/* Inventory Management */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stok Takibi
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Stok takip işlevleri henüz uygulanmadı.
              </Alert>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Uygulanacak özellikler:
                • Stok seviyesi takibi
                • Düşük stok uyarıları
                • Stok raporları
                • Tedarikçi yönetimi
              </Typography>
            </Paper>
          </Grid>

          {/* Reports & Analytics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Raporlar ve Analizler
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Raporlama ve analiz işlevleri henüz uygulanmadı.
              </Alert>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Uygulanacak özellikler:
                • Satış raporları
                • Performans metrikleri
                • Müşteri geri bildirim analizi
                • Stok raporları
                • Personel performans raporları
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminPage; 