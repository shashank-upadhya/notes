// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api'; // Use our configured axios instance

// // Define your Note type
// export interface Note {
//   _id: string;
//   title: string;
//   content: string;
// }

// interface NoteState {
//   notes: Note[];
//   isLoading: boolean;
//   isError: boolean;
//   message: string;
// }

// interface NewNoteData {
//   title: string;
//   content: string;
// }

// const initialState: NoteState = {
//   notes: [],
//   isLoading: false,
//   isError: false,
//   message: '',
// };

// // Async thunk to get user notes
// export const getNotes = createAsyncThunk('notes/getAll', async (_, thunkAPI) => {
//   try {
//     const response = await api.get('/notes');
//     return response.data;
//   } catch (error: any) {
//     const message = error.response?.data?.message || error.message;
//     return thunkAPI.rejectWithValue(message);
//   }
// });

// // You will also create thunks for 'createNote' and 'deleteNote' here

// export const createNote = createAsyncThunk('notes/create', async (noteData: NewNoteData, thunkAPI) => {
//   try {
//     const response = await api.post('/notes', noteData);
//     return response.data;
//   } catch (error: any) {
//     const message = error.response?.data?.message || error.message;
//     return thunkAPI.rejectWithValue(message);
//   }
// });

// export const deleteNote = createAsyncThunk('notes/delete', async (noteId: string, thunkAPI) => {
//   try {
//     await api.delete(`/notes/${noteId}`);
//     return noteId;
//   } catch (error: any) {
//     const message = error.response?.data?.message || error.message;
//     return thunkAPI.rejectWithValue(message);
//   }
// });

// export const noteSlice = createSlice({
//   name: 'notes',
//   initialState,
//   reducers: {
//     reset: (state) => initialState,
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(getNotes.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(getNotes.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.notes = action.payload;
//       })
//       .addCase(getNotes.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isError = true;
//         state.message = action.payload as string;
//       });
//       // Add cases for createNote and deleteNote here
//   },
// });

// export const { reset } = noteSlice.actions;
// export default noteSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'; // Use our configured axios instance

// Define your Note type
export interface Note {
  _id: string;
  title: string;
  content: string;
}

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  isError: boolean;
  message: string;
}

interface NewNoteData {
  title: string;
  content: string;
}

const initialState: NoteState = {
  notes: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Async thunk to get user notes
export const getNotes = createAsyncThunk('notes/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/notes');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const createNote = createAsyncThunk('notes/create', async (noteData: NewNoteData, thunkAPI) => {
  try {
    const response = await api.post('/notes', noteData);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteNote = createAsyncThunk('notes/delete', async (noteId: string, thunkAPI) => {
  try {
    await api.delete(`/notes/${noteId}`);
    return noteId;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Get Notes
      .addCase(getNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(getNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Create Note
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes.unshift(action.payload); // Add new note to the beginning
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Delete Note
      .addCase(deleteNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = state.notes.filter(note => note._id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset } = noteSlice.actions;
export default noteSlice.reducer;