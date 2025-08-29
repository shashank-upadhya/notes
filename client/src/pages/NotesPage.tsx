import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import { getNotes, createNote, deleteNote, reset } from '../features/notes/noteSlice';
import { useNavigate } from 'react-router-dom';
import type { Note } from '../features/notes/noteSlice';

const NotesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state for the new note form
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const { title, content } = newNote;

  const { user } = useSelector((state: RootState) => state.auth);
  const { notes, isLoading } = useSelector((state: RootState) => state.notes);

  useEffect(() => {
    if (!user) navigate('/login');
    dispatch(getNotes());
    return () => { dispatch(reset()); };
  }, [user, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewNote((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      dispatch(createNote({ title, content }));
      setNewNote({ title: '', content: '' }); // Clear form
    }
  };

  const onDelete = (noteId: string) => {
    dispatch(deleteNote(noteId));
  };

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Welcome, {user?.user.name}</h1>
      <p className="text-gray-600 mb-6">Your Notes</p>

      {/* Create Note Form */}
      <form onSubmit={onSubmit} className="mb-8 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Create a New Note</h2>
        <input
          type="text"
          name="title"
          value={title}
          onChange={onChange}
          placeholder="Note Title"
          className="w-full p-2 border rounded mb-2"
          required
        />
        <textarea
          name="content"
          value={content}
          onChange={onChange}
          placeholder="Note Content..."
          className="w-full p-2 border rounded mb-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
          Add Note
        </button>
      </form>

      {/* Notes List */}
      <section>
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note: Note) => (
              <div key={note._id} className="note-item p-4 border rounded-lg shadow-sm bg-white relative">
                <h3 className="font-bold text-lg mb-1">{note.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                <button 
                  onClick={() => onDelete(note._id)} 
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full hover:bg-red-700"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no notes yet. Create one above!</p>
        )}
      </section>
    </div>
  );
};

export default NotesPage;