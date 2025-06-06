import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Employee from './models/Employee.js'; // Ensure correct path to your models
import Admin from './models/Admin.js';     // Ensure correct path to your models
import Course from './models/Course.js';   // Ensure correct path to your models
import Project from './models/Project.js'; // Ensure correct path to your models
import dotenv from 'dotenv';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Employee.deleteMany({});
    await Admin.deleteMany({});
    await Course.deleteMany({});
    await Project.deleteMany({});
    console.log('🧹 Cleared existing collections');

    // Hash password once for all seeded users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Seed 2 employees
    const employee1 = new Employee({
      userId: 'emp01',
      name: 'Employee 01',
      password: hashedPassword,
      enrolledCourses: [],
      projects: [],
      tags: ['Frontend', 'JavaScript'], // Added tags for categorization
      completedCourses: [],
      badges: [],
      amount: 0,
      completedProjects: [],
      Email:'prathamsabharwal2005@gmail.com',
    });
    await employee1.save();
    console.log('👤 Seeded employee 1');

    const employee2 = new Employee({
      userId: 'emp02',
      name: 'Employee 02',
      password: hashedPassword,
      enrolledCourses: [],
      projects: [],
      tags: ['fullstack', 'mernstack'], // Added different tags for variety
      completedCourses: [],
      badges: [],
      amount: 0,
      completedProjects: [],
      Email:'prathamsabharwal18@gmail.com',
    });
    await employee2.save();
    console.log('👤 Seeded employee 2');


    // Seed 2 admins
    const admin1 = new Admin({
      userId: 'admin01',
      password: hashedPassword
    });
    await admin1.save();
    console.log('👮 Seeded admin 1');

    const admin2 = new Admin({
      userId: 'admin02',
      password: hashedPassword
    });
    await admin2.save();
    console.log('👮 Seeded admin 2');

    // Seed 10 courses
    const dummyCourses = [
      {
        title: "React Basics",
        courseId: "1",
        difficulty: "Beginner",
        tags: ["React", "Frontend", "JavaScript"],
        description: "Learn the fundamentals of React including components, props, and state.",
        imageUrl: "https://www.patterns.dev/img/reactjs/react-logo@3x.svg",
        badge: "React Rookie",
        amount: 1000,
      },
      {
        title: "Node.js for Beginners",
        courseId: "2",
        difficulty: "Beginner",
        tags: ["Node.js", "Backend", "JavaScript"],
        description: "Get started with server-side development using Node.js.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg",
        badge: "Node Newbie",
        amount: 1000,
      },
      {
        title: "Intermediate JavaScript",
        courseId: "3",
        difficulty: "Intermediate",
        tags: ["JavaScript", "Programming"],
        description: "Strengthen your JavaScript skills with deeper concepts and coding challenges.",
        imageUrl: "https://austingil.com/wp-content/uploads/JavaScript-Blog-Cover.svg",
        badge: "JavaScript Pro",
        amount: 1000,
      },
      {
        title: "MongoDB Essentials",
        courseId: "4",
        difficulty: "Intermediate",
        tags: ["MongoDB", "Database", "Backend"],
        description: "Master MongoDB and learn how to design efficient schemas and queries.",
        imageUrl: "https://www.opc-router.com/wp-content/uploads/2021/03/mongodb_thumbnail-200x269.png",
        badge: "MongoDB Master",
        amount: 1000,
      },
      {
        title: "Advanced CSS",
        courseId: "5",
        difficulty: "Advanced",
        tags: ["CSS", "Frontend", "Design"],
        description: "Explore animations, transitions, and responsive design techniques.",
        imageUrl: "https://www.oxfordwebstudio.com/user/pages/06.da-li-znate/sta-je-css/sta-je-css.png",
        badge: "CSS Guru",
        amount: 1000,
      },
      {
        title: "Express.js Crash Course",
        courseId: "6",
        difficulty: "Intermediate",
        tags: ["Express", "Backend", "Node.js"],
        description: "Build fast APIs and web servers using Express.js framework.",
        imageUrl: "https://miro.medium.com/v2/resize:fit:1400/format:webp/1*7fe7SkSNP6Y8PvTRm4Jl6Q.png",
        badge: "Express Expert",
        amount: 1000,
      },
      {
        title: "Fullstack Project Bootcamp",
        courseId: "7",
        difficulty: "Advanced",
        tags: ["Fullstack", "JavaScript", "React", "Node"],
        description: "Build a full MERN-stack project from start to finish.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqMbt6nB0aY8MVgACJexsZMo2KBbNoc8azyQ",
        badge: "Fullstack Hero",
        amount: 1000,
      },
      {
        title: "Git & GitHub",
        courseId: "8",
        difficulty: "Beginner",
        tags: ["Git", "Version Control"],
        description: "Understand Git version control and learn how to collaborate using GitHub.",
        imageUrl: "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20200529213529/Git-vs-GitHub.png",
        badge: "Git Guru",
        amount: 1000,
      },
      {
        title: "TypeScript Fundamentals",
        courseId: "9",
        difficulty: "Intermediate",
        tags: ["TypeScript", "JavaScript"],
        description: "Enhance JavaScript with TypeScript’s powerful type system.",
        imageUrl: "https://shanelonergan.github.io/assets/img/TypeScriptImage.jpeg",
        badge: "Typemaster",
        amount: 1000,
      },
      {
        title: "Frontend Optimization Techniques",
        courseId: "10",
        difficulty: "Advanced",
        tags: ["Frontend", "Performance", "Web Dev"],
        description: "Speed up websites using performance optimization strategies.",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?fit=crop&w=800&q=80",
        badge: "Frontend Speedster",
        amount: 1000,
      }
    ];

    await Course.insertMany(dummyCourses);
    console.log('📘 Seeded 10 courses');

    // Seed 2 projects
    const projects = [
      {
        title: "Employee Onboarding System",
        projectId: "proj01",
        description: "Build an internal onboarding web portal",
        tasks: ["Setup frontend", "Create backend API"],
        deadline: "2025-07-15",
        assignedEmployees:[], // Assign to employee1
        status: "upcoming",
        tags: ["HR", "onboarding"],
        amount: 5000
      },
      {
        title: "AI Chatbot Integration",
        projectId: "proj02",
        description: "Integrate a chatbot in the main website",
        tasks: ["Define flow", "API setup"],
        deadline: "2025-08-01",
        assignedEmployees:[], // Assign to employee2
        status: "upcoming",
        tags: ["AI", "chatbot"],
        amount: 5000
      }
    ];

    const insertedProjects = await Project.insertMany(projects);
    console.log('📂 Seeded 2 projects');

    // // Link first project to employee1's project list
    // employee1.projects.push(insertedProjects[0]._id);
    // await employee1.save();
    // console.log('🔗 Linked employee 1 to project');

    // // Link second project to employee2's project list (optional, but good for linking)
    // employee2.projects.push(insertedProjects[1]._id);
    // await employee2.save();
    // console.log('🔗 Linked employee 2 to project');


    await mongoose.disconnect();
    console.log('✅ Seeding complete and disconnected');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1); // Exit with an error code
  }
}

seed();