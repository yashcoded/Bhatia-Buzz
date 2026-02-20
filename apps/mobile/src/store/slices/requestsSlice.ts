import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Request } from '../../types';
import * as firestoreService from '../../services/firebase/firestore';

interface RequestsState {
  requests: Request[];
  loading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  requests: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (type?: 'condolence' | 'celebration' | 'match') => {
    return await firestoreService.getRequests(type);
  }
);

export const createRequest = createAsyncThunk(
  'requests/createRequest',
  async (request: Omit<Request, 'id' | 'createdAt' | 'status'>) => {
    const id = await firestoreService.createRequest(request);
    return { id, ...request, createdAt: new Date().toISOString(), status: 'pending' as const };
  }
);

export const updateRequestStatus = createAsyncThunk(
  'requests/updateRequestStatus',
  async ({ requestId, status, adminNotes }: { requestId: string; status: 'approved' | 'rejected'; adminNotes?: string }) => {
    await firestoreService.updateRequestStatus(requestId, status, adminNotes);
    return { requestId, status, adminNotes };
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch requests';
      })
      // Create request
      .addCase(createRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload as Request);
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create request';
      })
      // Update request status
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const request = state.requests.find((r) => r.id === action.payload.requestId);
        if (request) {
          request.status = action.payload.status;
          if (action.payload.adminNotes) {
            request.adminNotes = action.payload.adminNotes;
          }
        }
      });
  },
});

export const { clearError } = requestsSlice.actions;
export default requestsSlice.reducer;

