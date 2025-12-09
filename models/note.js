import mongoose from 'mongoose';

const ChecklistItemSchema = new mongoose.Schema({
  id: { type: String },
  text: { type: String },
  checked: { type: Boolean, default: false }
}, { _id: false });

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  color: { type: String, default: 'default' },
  labels: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isChecklist: { type: Boolean, default: false },
  checklistItems: { type: [ChecklistItemSchema], default: [] },
  reminderDate: { type: Number, default: null },
  // legacy/simple category field (optional)
  category: { type: String, default: 'general' }
}, {
  timestamps: true
});

const Note = mongoose.model('Note', noteSchema);

export default Note;