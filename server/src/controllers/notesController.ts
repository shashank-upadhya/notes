import { Request, Response } from 'express';
import Note from '../models/Note.js';
import Joi from 'joi';

// Extend Express Request type to include user with _id
declare global {
  namespace Express {
    interface User {
      _id: string;
      // add other user properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

// --- 1. Get All Notes for a User ---
export const getNotes = async (req: Request, res: Response) => {
  try {
    // Safety check to ensure user is logged in
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// --- 2. Create a New Note ---
export const createNote = async (req: Request, res: Response) => {
  const schema = Joi.object({
    title: Joi.string().min(1).required(),
    content: Joi.string().min(1).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details?.[0]?.message ?? "Invalid input provided.";
    return res.status(400).json({ message: errorMessage });
  }

  try {
    // Safety check to ensure user is logged in
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const { title, content } = value;
    const note = new Note({
      title,
      content,
      user: req.user._id, // Now TypeScript knows this is safe
    });
    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// --- 3. Delete a Note ---
export const deleteNote = async (req: Request, res: Response) => {
  try {
    // Safety check to ensure user is logged in
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    // Ensure the note belongs to the logged-in user
    // We can now safely access req.user._id
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this note.' });
    }

    await note.deleteOne();
    res.status(200).json({ message: 'Note removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};