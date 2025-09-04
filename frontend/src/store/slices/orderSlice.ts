import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderState {
  items: OrderItem[];
  completedOrder: {
    items: OrderItem[];
    note: string;
    timestamp: string | null;
  };
  status: 'idle' | 'pending' | 'confirmed';
  note: string;
}

const initialState: OrderState = {
  items: [],
  completedOrder: {
    items: [],
    note: '',
    timestamp: null
  },
  status: 'idle',
  note: '',
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{id: string, name: string, price: number}>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{id: string, quantity: number}>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    setNote: (state, action: PayloadAction<string>) => {
      state.note = action.payload;
    },
    submitOrder: (state) => {
      state.completedOrder = {
        items: [...state.items],
        note: state.note,
        timestamp: new Date().toISOString()
      };
      state.status = 'pending';
    },
    confirmOrder: (state) => {
      state.status = 'confirmed';
    },
    clearOrder: (state) => {
      state.items = [];
      state.note = '';
      state.status = 'idle';
    },
    clearCompletedOrder: (state) => {
      state.completedOrder = initialState.completedOrder;
    }
  },
});

export const { 
  addItem, 
  removeItem, 
  updateQuantity, 
  setNote, 
  submitOrder, 
  confirmOrder,
  clearOrder,
  clearCompletedOrder
} = orderSlice.actions;

export default orderSlice.reducer;

export {}; // Add this to fix isolatedModules error