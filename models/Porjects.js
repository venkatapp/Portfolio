import mongoose from 'mongoose';


const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageKey: String,     
  imageMimeType: String,  
  imageSize: Number,     
})

const Projects = mongoose.model('Project', projectSchema);
export default Projects;