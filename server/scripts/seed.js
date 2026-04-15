require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';

const COLORS = ['#7c6af7', '#f76c6c', '#5ee7bf', '#ff9f43', '#54a0ff', '#a55eea'];

const SEED_DATA = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: 'password123',
    },
    {
      name: 'John Developer',
      email: 'john@taskflow.com',
      password: 'password123',
    },
    {
      name: 'Sarah Designer',
      email: 'sarah@taskflow.com',
      password: 'password123',
    },
  ],
  projects: [
    {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      color: '#7c6af7',
      tags: ['frontend', 'design'],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Mobile App Development',
      description: 'Build a native mobile application for iOS and Android',
      color: '#54a0ff',
      tags: ['mobile', 'react-native'],
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  ],
  tasks: [
    // Website Redesign tasks
    { title: 'Create wireframes for homepage', status: 'done', priority: 'high', labels: ['design'] },
    { title: 'Design navigation menu', status: 'done', priority: 'medium', labels: ['design'] },
    { title: 'Create hero section mockup', status: 'in_progress', priority: 'high', labels: ['design'] },
    { title: 'Review brand guidelines', status: 'in_review', priority: 'low', labels: ['content'] },
    { title: 'Update color palette', status: 'todo', priority: 'medium', labels: ['design'] },
    { title: 'Create footer design', status: 'todo', priority: 'low', labels: ['design'] },
    { title: 'Design contact page', status: 'todo', priority: 'medium', labels: ['design'] },
    
    // Mobile App tasks
    { title: 'Set up React Native project', status: 'done', priority: 'urgent', labels: ['setup'] },
    { title: 'Configure navigation', status: 'done', priority: 'high', labels: ['navigation'] },
    { title: 'Implement authentication flow', status: 'in_progress', priority: 'urgent', labels: ['auth'] },
    { title: 'Create dashboard screen', status: 'in_progress', priority: 'high', labels: ['ui'] },
    { title: 'Build task list component', status: 'todo', priority: 'high', labels: ['component'] },
    { title: 'Add push notifications', status: 'todo', priority: 'medium', labels: ['notifications'] },
    { title: 'Implement offline mode', status: 'todo', priority: 'low', labels: ['offline'] },
    { title: 'Build settings screen', status: 'todo', priority: 'low', labels: ['settings'] },
  ],
  comments: [
    { content: 'This looks great! Ready for review.' },
    { content: 'Can we schedule a call to discuss the details?' },
    { content: 'I\'ve made the requested changes.' },
    { content: 'Please review this by end of day.' },
    { content: 'Updated the design based on feedback.' },
  ],
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Notification.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    // Create users
    console.log('Creating users...');
    const users = [];
    for (const userData of SEED_DATA.users) {
      const password = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password,
        isVerified: true,
      });
      users.push(user);
      console.log(`  Created user: ${user.email}`);
    }

    // Create projects
    console.log('Creating projects...');
    const projects = [];
    for (let i = 0; i < SEED_DATA.projects.length; i++) {
      const projectData = SEED_DATA.projects[i];
      const project = await Project.create({
        ...projectData,
        owner: users[0]._id,
        members: [
          { user: users[0]._id, role: 'owner' },
          { user: users[1]._id, role: 'admin' },
          { user: users[2]._id, role: 'member' },
        ],
        status: 'active',
      });
      projects.push(project);
      console.log(`  Created project: ${project.name}`);
    }

    // Create tasks
    console.log('Creating tasks...');
    const taskStatuses = ['todo', 'todo', 'todo', 'in_progress', 'in_progress', 'in_review', 'done', 'done'];
    const taskPriorities = ['low', 'medium', 'high', 'urgent'];
    
    for (let i = 0; i < SEED_DATA.tasks.length; i++) {
      const taskData = SEED_DATA.tasks[i];
      const projectIndex = i < 7 ? 0 : 1;
      const project = projects[projectIndex];
      
      const task = await Task.create({
        ...taskData,
        project: project._id,
        createdBy: users[i % 3]._id,
        assignees: [users[(i + 1) % 3]._id],
        dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
        description: `Task description for "${taskData.title}". This is a sample task that demonstrates the task detail view functionality.`,
      });
      
      // Add comments to some tasks
      if (i % 3 === 0 && SEED_DATA.comments[i % SEED_DATA.comments.length]) {
        task.comments.push({
          user: users[(i + 1) % 3]._id,
          content: SEED_DATA.comments[(i + 1) % SEED_DATA.comments.length].content,
        });
        await task.save();
      }
      
      console.log(`  Created task: ${task.title}`);
    }

    // Create sample notifications for users
    console.log('Creating notifications...');
    for (const user of users) {
      await Notification.create([
        {
          recipient: user._id,
          sender: users[0]._id,
          type: 'task_assigned',
          message: `You have been assigned to "${SEED_DATA.tasks[0].title}"`,
          link: `/projects/${projects[0]._id}/tasks`,
          relatedProject: projects[0]._id,
        },
        {
          recipient: user._id,
          sender: users[1]._id,
          type: 'comment_added',
          message: 'John commented on a task in Website Redesign',
          link: `/projects/${projects[0]._id}`,
          relatedProject: projects[0]._id,
        },
      ]);
      console.log(`  Created notifications for: ${user.email}`);
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📧 Login credentials:');
    console.log('  Admin: admin@taskflow.com / password123');
    console.log('  John:  john@taskflow.com / password123');
    console.log('  Sarah: sarah@taskflow.com / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();