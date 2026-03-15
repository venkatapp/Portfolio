import mongoose from 'mongoose';


const projectSchema = new mongoose.Schema({
  title: String,
  description: Number,
  imageKey: String,     
  imageMimeType: String, 
  imageSize: Number,     
})

const Projects = mongoose.model('Project', projectSchema);
export default Projects;