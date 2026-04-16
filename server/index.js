import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import mongoose from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const autoMigrate = async () => {
  try {
    const lessonCount = await Lesson.countDocuments();
    const topicCount = await Topic.countDocuments();
    if (lessonCount === 0 || topicCount === 0) {
      console.log('🔄 Database empty. Starting auto-migration...');
      const lessonsPath = path.join(__dirname, 'data', 'lessons.json');
      const topicsPath = path.join(__dirname, 'data', 'topics.json');
      if (fs.existsSync(lessonsPath)) {
        const lessons = JSON.parse(fs.readFileSync(lessonsPath));
        for (let l of lessons) await Lesson.findOneAndUpdate({ slug: l.slug }, l, { upsert: true });
        console.log(`✅ Migrated ${lessons.length} lessons.`);
      }
      if (fs.existsSync(topicsPath)) {
        const topics = JSON.parse(fs.readFileSync(topicsPath));
        for (let t of topics) await Topic.findOneAndUpdate({ id: t.id }, t, { upsert: true });
        console.log(`✅ Migrated ${topics.length} topics.`);
      }
    }
  } catch (err) {
    console.error('❌ Auto-migration failed:', err.message);
  }
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    autoMigrate();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Schemas & Models
const topicSchema = new mongoose.Schema({
  id: String,
  name: String,
  subtitle: String,
  icon: String,
  description: String,
  status: String, 
}, { timestamps: true });

const lessonSchema = new mongoose.Schema({
  id: String,
  title: String,
  slug: { type: String, unique: true },
  course: String,
  chapterOrder: Number,
  description: String,
  blocks: [Object],
}, { timestamps: true });

const Topic = mongoose.model('Topic', topicSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);

// Serve uploaded audio files as static
const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
app.use('/audio', express.static(audioDir));

// Multer: save audio to server/public/audio/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `audio-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// --- API ROUTES ---

// 1. Admin: Upload Audio
app.post('/api/admin/upload-audio', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  const audioUrl = `/audio/${req.file.filename}`;
  res.json({ success: true, audioUrl, filename: req.file.filename });
});

// 2. Lessons: Get All
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ chapterOrder: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load lessons' });
  }
});

// 3. Lesson: Get by Slug
app.get('/api/lessons/:slug', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.slug });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load lesson' });
  }
});

// 4. Admin: Save/Update Lesson
app.post('/api/admin/save-lesson', async (req, res) => {
  try {
    const newLessonData = req.body;
    const lesson = await Lesson.findOneAndUpdate(
      { slug: newLessonData.slug },
      newLessonData,
      { upsert: true, new: true }
    );
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save lesson' });
  }
});

// 5. Admin: Delete Lesson
app.delete('/api/admin/delete-lesson/:slug', async (req, res) => {
  try {
    await Lesson.deleteOne({ slug: req.params.slug });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// 6. Topics: Get All
app.get('/api/topics', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

// 7. Admin: Save/Update Topic
app.post('/api/admin/save-topic', async (req, res) => {
  try {
    const newTopicData = req.body;
    const topic = await Topic.findOneAndUpdate(
      { id: newTopicData.id },
      newTopicData,
      { upsert: true, new: true }
    );
    res.json({ success: true, topic });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save topic' });
  }
});

// 8. Admin: Delete Topic
app.delete('/api/admin/delete-topic/:topicId', async (req, res) => {
  try {
    await Topic.deleteOne({ id: req.params.topicId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// 9. (Self-Healing) Data Migration Tool: File to MongoDB
app.get('/api/admin/migrate-data', async (req, res) => {
  try {
    const lessonsPath = path.join(__dirname, 'data', 'lessons.json');
    const topicsPath = path.join(__dirname, 'data', 'topics.json');
    
    let count = { lessons: 0, topics: 0 };

    if (fs.existsSync(lessonsPath)) {
      const lessons = JSON.parse(fs.readFileSync(lessonsPath));
      for (let l of lessons) {
        await Lesson.findOneAndUpdate({ slug: l.slug }, l, { upsert: true });
        count.lessons++;
      }
    }
    
    if (fs.existsSync(topicsPath)) {
      const topics = JSON.parse(fs.readFileSync(topicsPath));
      for (let t of topics) {
        await Topic.findOneAndUpdate({ id: t.id }, t, { upsert: true });
        count.topics++;
      }
    }
    
    res.json({ success: true, message: 'All current data has been successfully stored in your MongoDB cloud database.', results: count });
  } catch (err) {
    res.status(500).json({ error: 'Migration failed', details: err.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
