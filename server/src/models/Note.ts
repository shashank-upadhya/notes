// server/src/models/Note.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  user: mongoose.Schema.Types.ObjectId;
}

const noteSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Note = mongoose.model<INote>('Note', noteSchema);
export default Note;