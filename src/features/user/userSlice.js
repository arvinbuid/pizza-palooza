import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAddress } from '../../services/apiGeocoding';

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// Redux Toolkit way of fetching data
export const fetchAddress = createAsyncThunk(
  'user/fetchAddress',
  async function () {
    // 1) Get user's geolocation position
    const positionObj = await getPosition();
    const position = {
      latitude: positionObj.coords.latitude,
      longitude: positionObj.coords.longitude,
    };

    // 2) Use reverse geocoding API to get a description of the user's address, so it can be displayed on the order form, so that the user can correct it if wrong
    const addressObj = await getAddress(position);
    const address = `${addressObj?.city}, ${addressObj?.countryCode}`;

    // 3) Then we return an object with the data that we are interested in
    // Payload of the fullfilled state inside the extraReducers builder
    return { position, address };
  },
);

const initialState = {
  username: '',
  status: 'idle',
  position: {},
  address: '',
  error: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName(state, action) {
      state.username = action.payload;
    },
  },
  // connecting thunk to reducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddress.fulfilled, (state, action) => {
        state.position = action.payload.position;
        state.address = action.payload.address;
        state.status = 'idle';
      })
      .addCase(fetchAddress.rejected, (state) => {
        (state.status = 'error'),
          (state.error =
            'There was a problem getting your address. Make sure to input your address or allow access location from your browser.');
      });
  },
});

export const { updateName } = userSlice.actions;

export default userSlice.reducer;
