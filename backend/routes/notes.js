import express from 'express';
import Note from '../models/note.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         color:
 *           type: string
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         isPinned:
 *           type: boolean
 *         isArchived:
 *           type: boolean
 *         isChecklist:
 *           type: boolean
 *         checklistItems:
 *           type: array
 *           items:
 *             type: object
 *         reminderDate:
 *           type: number
 *         category:
 *           type: string
 *         createdAt:
 *           type: number
 *         updatedAt:
 *           type: number
 */

function mapNote(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title || '',
    content: doc.content || '',
    color: doc.color || 'default',
    labels: doc.labels || [],
    isPinned: !!doc.isPinned,
    isArchived: !!doc.isArchived,
    isChecklist: !!doc.isChecklist,
    checklistItems: doc.checklistItems || [],
    reminderDate: doc.reminderDate || null,
    category: doc.category || 'general',
    createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).getTime() : Date.now(),
  };
}

/**
 * @openapi
 * /api/notes:
 *   get:
 *     summary: Get all notes
 *     tags:
 *       - Notes
 *     responses:
 *       200:
 *         description: A list of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 */
// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes.map(mapNote));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags:
 *       - Notes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       201:
 *         description: Note created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 */
// Create a new note
router.post('/', async (req, res) => {
  const payload = {
    title: req.body.title || '',
    content: req.body.content || '',
    color: req.body.color || 'default',
    labels: req.body.labels || [],
    isPinned: !!req.body.isPinned,
    isArchived: !!req.body.isArchived,
    isChecklist: !!req.body.isChecklist,
    checklistItems: req.body.checklistItems || [],
    reminderDate: req.body.reminderDate || null,
    category: req.body.category || req.body.category || 'general'
  };

  try {
    const note = new Note(payload);
    const newNote = await note.save();
    res.status(201).json(mapNote(newNote));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/notes/{id}:
 *   get:
 *     summary: Get a single note by ID
 *     tags:
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: A single note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 */
// Get a single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      res.json(mapNote(note));
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/notes/{id}:
 *   patch:
 *     summary: Update a note
 *     tags:
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       200:
 *         description: Updated note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 */
// Update a note
router.patch('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      const updatable = ['title','content','color','labels','isPinned','isArchived','isChecklist','checklistItems','reminderDate','category'];
      updatable.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(req.body, k)) {
          note[k] = req.body[k];
        }
      });

      const updatedNote = await note.save();
      res.json(mapNote(updatedNote));
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @openapi
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags:
 *       - Notes
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Note deleted
 *       404:
 *         description: Note not found
 */
// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      await note.deleteOne();
      res.json({ message: 'Note deleted' });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;