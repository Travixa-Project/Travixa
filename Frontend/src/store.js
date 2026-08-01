import { configureStore } from '@reduxjs/toolkit';
import CartSlice from './slices/CartSlice';

const store = configureStore({
    reducer: {
        CartSlice
    }
})
export default store