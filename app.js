import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import uploadFeature from '@adminjs/upload';
import * as AdminJSMongoose from '@adminjs/mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();


import Projects from './models/Porjects.js';
import authRoutes from './routes/authRoutes.js';

import { ComponentLoader } from 'adminjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadTempDir = path.join('E:\\giri\\portal\\Portfolio\\temp');
if (!fs.existsSync(uploadTempDir)) {
  fs.mkdirSync(uploadTempDir, { recursive: true });
}

// Override the temp directory
os.tmpdir = () => uploadTempDir;
process.env.TMPDIR = uploadTempDir;
process.env.TEMP = uploadTempDir;
process.env.TMP = uploadTempDir;

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Register AdminJS adapter for Mongoose
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Initialize ComponentLoader
const componentLoader = new ComponentLoader();

// Configure upload feature
const uploadFeatureConfig = uploadFeature({
  componentLoader,
  provider: {
    local: {
      bucket: path.join(__dirname, 'public','uploads'),
      opts: { baseUrl: '/uploads' },
    },
  },
  properties: {
    file: 'image',
    key: 'imageKey',
    mimeType: 'imageMimeType',
    size: 'imageSize',
    bucket: 'imageBucket',
  },
  validation: {
    mimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
  },
  // This controls the file path - return just filename for flat structure
  uploadPath: (record, filename) => {
    // Generate unique filename while preserving extension
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = filename.substring(filename.lastIndexOf('.'));
    return `${timestamp}-${randomString}${extension}`;
  },
});


// Configure AdminJS options
const adminOptions = {
  componentLoader,
  resources: [
    {
      resource: Projects,
      options: {
        properties: {
          imageKey: { 
            isVisible: { list: false, show: true, edit: false },
            position: 2,
          },
          imageMimeType: { 
            isVisible: { list: false, show: true, edit: false } 
          },
          imageSize: { 
            isVisible: { list: false, show: true, edit: false } 
          },
        },
      },
      features: [uploadFeatureConfig],
    },
    {
      resource: User,
      options: {
        properties: {
          password: {
            isVisible: { list: false, filter: false, show: false, edit: true },
            type: 'password',
          },
          createdAt: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
        },
        actions: {
          toggleActive: {
            actionType: 'record',
            icon: 'Toggle',
            handler: async (request, response, context) => {
              const { record, resource } = context;
              const currentStatus = record.param('isActive');
              await resource.update(record.id(), { isActive: !currentStatus });
              return {
                record: record.toJSON(context.currentAdmin),
                notice: {
                  message: `User ${record.param('name')} active status toggled successfully!`,
                  type: 'success',
                },
              };
            },
            component: false,
          },
        },
      },
    },
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'Kreative Hussain Dashboard',
    softwareBrothers: false,
    logo: false,
  },
};


// Initialize AdminJS
const admin = new AdminJS(adminOptions);

// Enable AdminJS watch mode in development
if (process.env.NODE_ENV === 'development') {
  admin.watch();
}

// IMPORTANT: Order of middleware matters!
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Session configuration (needed for AdminJS)
const sessionConfig = {
  secret: process.env.COOKIE_PASSWORD || 'your-fallback-secret-key-for-development',
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: 'adminjs',
};

// Apply session middleware
app.use(session(sessionConfig));

// Authentication
const authenticate  = async (email, password)=>{

  const user=await User.findOne({email})
  if(user){
    const matched=await bcrypt.compare(password, user.password);
    if(matched){
      return{
        email:user.email, 
        role:user.role,
        _id:user._id
      }
    }
  }
  return null;
}

// Build and use AdminJS router (this must come BEFORE body-parser)
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate,
    cookieName:'adminjs',
    cookiePassword:process.env.COOKIE_PASSWORD

  },
  null,
  sessionConfig
);

app.use(admin.options.rootPath, adminRouter);

// NOW it's safe to add body-parser/express.json middleware AFTER AdminJS router
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes (separate from AdminJS)
app.use('/api/auth', authRoutes);

// Regular routes come after body-parser
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>AdminJS MongoDB Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { color: #333; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .button { 
            display: inline-block; 
            background: #0066cc; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 5px;
            margin-top: 20px;
          }
          .button:hover { background: #0052a3; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to AdminJS MongoDB Dashboard</h1>
          <p>Your admin dashboard is ready to use!</p>
          <p>Login credentials:</p>
          <ul>
            <li><strong>Email:</strong> admin@example.com</li>
            <li><strong>Password:</strong> password</li>
          </ul>
          <a href="/admin" class="button">Go to Admin Dashboard</a>
        </div>
      </body>
    </html>
  `); 
});

// Add this after your other middleware
// Serve static HTML for reset password page (optional)
app.get('/reset-password/:token', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Password</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
        .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        h2 { margin-bottom: 20px; color: #333; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; color: #555; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { background: #4CAF50; color: white; padding: 12px; border: none; border-radius: 4px; width: 100%; cursor: pointer; font-size: 16px; }
        button:hover { background: #45a049; }
        .message { margin-top: 15px; padding: 10px; border-radius: 4px; display: none; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Reset Your Password</h2>
        <form id="resetForm">
          <div class="form-group">
            <label for="password">New Password</label>
            <input type="password" id="password" name="password" required minlength="6">
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
          </div>
          <button type="submit">Reset Password</button>
          <div id="message" class="message"></div>
        </form>
      </div>

      <script>
        document.getElementById('resetForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const token = window.location.pathname.split('/').pop();
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          const messageDiv = document.getElementById('message');
          
          try {
            const response = await fetch('/api/auth/reset-password/' + token, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ password, confirmPassword })
            });
            
            const data = await response.json();
            
            messageDiv.style.display = 'block';
            
            if (data.success) {
              messageDiv.className = 'message success';
              messageDiv.textContent = data.message;
              
              // Redirect to admin login after 3 seconds
              setTimeout(() => {
                window.location.href = '/admin/login';
              }, 3000);
            } else {
              messageDiv.className = 'message error';
              messageDiv.textContent = data.message;
            }
          } catch (error) {
            messageDiv.style.display = 'block';
            messageDiv.className = 'message error';
            messageDiv.textContent = 'An error occurred. Please try again.';
          }
        });
      </script>
    </body>
    </html>
  `);
});


// 7. Error handling middleware (always last)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
  console.log(`📊 AdminJS dashboard available at http://localhost:${PORT}${admin.options.rootPath}`);
  console.log(`🔑 Login with: admin@example.com / password`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});