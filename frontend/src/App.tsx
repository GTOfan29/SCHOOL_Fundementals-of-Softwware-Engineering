import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material';
import store from './store/store';
import MenuPage from './pages/Customer/MenuPage';
import LoginPage from './pages/Customer/LoginPage';
import OrderReviewPage from './pages/Customer/OrderReviewPage';
import OrderStatusPage from './pages/Customer/OrderStatusPage';
import KitchenDisplayPage from './pages/Kitchen/KitchenDisplayPage';
import ServerPage from './pages/Server/ServerPage';
import AdminPage from './pages/Admin/AdminPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#C85E3B',
    },
    secondary: {
      main: '#2C1810',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/order-review" element={<OrderReviewPage />} />
            <Route path="/order-status" element={<OrderStatusPage />} />
            <Route path="/kitchen" element={<KitchenDisplayPage />} />
            <Route path="/server" element={<ServerPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
