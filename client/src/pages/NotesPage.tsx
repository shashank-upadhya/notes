// import { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import type { AppDispatch, RootState } from '../app/store';
// import { getNotes, createNote, deleteNote, reset } from '../features/notes/noteSlice';
// import { useNavigate } from 'react-router-dom';
// import type { Note } from '../features/notes/noteSlice';

// const NotesPage = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();
  
//   // Local state for the new note form
//   const [newNote, setNewNote] = useState({ title: '', content: '' });
//   const { title, content } = newNote;

//   const { user } = useSelector((state: RootState) => state.auth);
//   const { notes, isLoading } = useSelector((state: RootState) => state.notes);

//   useEffect(() => {
//     if (!user) navigate('/login');
//     dispatch(getNotes());
//     return () => { dispatch(reset()); };
//   }, [user, navigate, dispatch]);

//   const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setNewNote((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
//   };

//   const onSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (title && content) {
//       dispatch(createNote({ title, content }));
//       setNewNote({ title: '', content: '' }); // Clear form
//     }
//   };

//   const onDelete = (noteId: string) => {
//     dispatch(deleteNote(noteId));
//   };

//   if (isLoading) {
//     return <h2>Loading...</h2>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold">Welcome, {user?.user.name}</h1>
//       <p className="text-gray-600 mb-6">Your Notes</p>

//       {/* Create Note Form */}
//       <form onSubmit={onSubmit} className="mb-8 p-4 border rounded-lg shadow-sm">
//         <h2 className="text-xl font-semibold mb-2">Create a New Note</h2>
//         <input
//           type="text"
//           name="title"
//           value={title}
//           onChange={onChange}
//           placeholder="Note Title"
//           className="w-full p-2 border rounded mb-2"
//           required
//         />
//         <textarea
//           name="content"
//           value={content}
//           onChange={onChange}
//           placeholder="Note Content..."
//           className="w-full p-2 border rounded mb-2"
//           required
//         />
//         <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
//           Add Note
//         </button>
//       </form>

//       {/* Notes List */}
//       <section>
//         {notes.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {notes.map((note: Note) => (
//               <div key={note._id} className="note-item p-4 border rounded-lg shadow-sm bg-white relative">
//                 <h3 className="font-bold text-lg mb-1">{note.title}</h3>
//                 <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
//                 <button 
//                   onClick={() => onDelete(note._id)} 
//                   className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full hover:bg-red-700"
//                 >
//                   X
//                 </button>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>You have no notes yet. Create one above!</p>
//         )}
//       </section>
//     </div>
//   );
// };

// export default NotesPage;

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaTrashAlt } from 'react-icons/fa';
import type { AppDispatch, RootState } from '../app/store';
import { getNotes, createNote, deleteNote, reset } from '../features/notes/noteSlice';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import type { Note } from '../features/notes/noteSlice';
import logo from '../assets/logo.png'; // Make sure you have the logo in your assets

const NotesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // State to control the create note modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const { title, content } = newNote;

  const { user } = useSelector((state: RootState) => state.auth);
  const { notes, isLoading } = useSelector((state: RootState) => state.notes);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getNotes());
    }
    return () => { dispatch(reset()); };
  }, [user, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewNote((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title) { // Content can be optional
      dispatch(createNote({ title, content }));
      setNewNote({ title: '', content: '' });
      setIsModalOpen(false); // Close modal on submit
    }
  };

  const onDelete = (noteId: string) => {
    dispatch(deleteNote(noteId));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (isLoading && notes.length === 0) {
    return <div className="grid h-screen place-items-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={logo} alt="HD Logo" className="h-6 w-auto" />
          <span className="font-bold text-xl">Dashboard</span>
        </div>
        <button onClick={handleLogout} className="text-blue-600 font-semibold hover:underline">
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        {/* Welcome Card */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.user.name} !</h1>
          <p className="text-gray-500">Email: {user?.user.email}</p>
        </div>

        {/* Create Note Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors mb-6"
        >
          Create Note
        </button>

        {/* Notes Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Notes</h2>
          <div className="space-y-3">
            {notes.length > 0 ? (
              notes.map((note: Note) => (
                <div key={note._id} className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
                  <span className="font-medium">{note.title}</span>
                  <button onClick={() => onDelete(note._id)} className="text-gray-400 hover:text-red-500">
                    <FaTrashAlt />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">You have no notes yet.</p>
            )}
          </div>
        </div>
      </main>

      {/* Create Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">New Note</h2>
            <form onSubmit={onSubmit}>
              <input
                type="text"
                name="title"
                value={title}
                onChange={onChange}
                placeholder="Note Title"
                className="w-full p-2 border rounded mb-4"
                required
              />
              <textarea
                name="content"
                value={content}
                onChange={onChange}
                placeholder="Note Content (optional)..."
                className="w-full p-2 border rounded mb-4 h-32"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;