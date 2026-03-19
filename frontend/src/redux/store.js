import rootSlice from "./rootSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

const reducer = combineReducers({
    root: rootSlice,
});

export const store = configureStore({
    reducer,
});

export default store;