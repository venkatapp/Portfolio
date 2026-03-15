import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import uploadFeature from '@adminjs/upload';
import * as AdminJSMongoose from '@adminjs/mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

import { ComponentLoader } from 'adminjs'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Projects from './models/Porjects.js';

const componentLoader = new ComponentLoader();

const uploadFeatures = uploadFeature({
  componentLoader, // Must be passed here
  provider: {
    local: {
      bucket: path.join(__dirname, 'public/uploads'), // Where files are saved
    },
  },
  properties: {
    // Virtual property for file upload (not stored in DB)
    file: 'image',
    // Where the file path (key) will be stored
    key: 'imageKey',
    // Where mime type will be stored (enables previews)
    mimeType: 'imageMimeType',
    // Where file size will be stored
    size: 'imageSize',
    // Optional: store bucket name
    bucket: 'imageBucket',
  },
  // Optional: Validate file types
  validation: {
    mimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
  },
})  


const app = express();
const PORT = process.env.PORT;

app.use('/uploads', express.static('public/uploads'))

// Register AdminJS adapter for Mongoose
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Configure AdminJS options with resource customization
const adminOptions = {
  componentLoader,
  resources: [
{
      resource: Projects,
      options: {
        properties: {
          // Configure how fields appear in AdminJS
          imageKey: { isVisible: { list: false, show: true, edit: false } },
          imageMimeType: { isVisible: { list: false, show: true, edit: false } },
          imageSize: { isVisible: { list: false, show: true, edit: false } },
        },
      },
      features: [uploadFeatures],
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
          // Custom action example: toggle user active status
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
    companyName: 'My Admin Dashboard',
    softwareBrothers: false,
    logo: false,
  },
};

// Initialize AdminJS
const admin = new AdminJS(adminOptions);

// IMPORTANT FIX: Proper session configuration
// First, set up express session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-fallback-secret-key-for-development',
  resave: true, // Changed to true for better compatibility
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  name: 'adminjs.sid', // Custom session name to avoid conflicts
});

// Apply session middleware to express app
app.use(sessionMiddleware);

// Set up authentication with proper session configuration
const authenticationOptions = {
  authenticate: async (email, password) => {
    // Simple hardcoded authentication - replace with database check in production
    if (email === 'admin@example.com' && password === 'password') {
      return { 
        email, 
        role: 'admin',
        name: 'Admin User' 
      };
    }
    return null;
  },
  cookiePassword: process.env.COOKIE_SECRET || process.env.SESSION_SECRET || 'your-fallback-cookie-secret',
};

// Build authenticated router with proper session configuration
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  authenticationOptions,
  null, // No predefined router
  {
    // These options are passed to express-session
    secret: process.env.SESSION_SECRET || 'your-fallback-secret-key-for-development',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
    name: 'adminjs.sid',
  },
  // Optional: Add your own view path for login page
  // '/login'
);

// Use admin router
app.use(admin.options.rootPath, adminRouter);

// Add a simple home route
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

admin.watch();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
  console.log(`📊 AdminJS dashboard available at http://localhost:${PORT}${admin.options.rootPath}`);
  console.log(`🔑 Login with: admin@example.com / password`);
});