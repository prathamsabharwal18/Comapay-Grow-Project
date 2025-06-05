import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    // enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  badge :[{
    type: String,  // Assuming badges are stored as strings
  }],
  amount: {
    type: Number,
    required: true,
  },
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
