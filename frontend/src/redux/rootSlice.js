import { createSlice } from "@reduxjs/toolkit";

const rootSlice = createSlice({
    name: "root",
    initialState: {
        loading: false,
        portfolioData: null,
    },
    reducers: {
        showLoading: (state, action) => {
            state.loading = true;
        },
        hideLoading: (state, action) => {
            state.loading = false;
        },
        setPortfolioData: (state, action) => {
            state.portfolioData = action.payload;
        },
    },
});

export const { showLoading, hideLoading, setPortfolioData } = rootSlice.actions;
export default rootSlice.reducer;