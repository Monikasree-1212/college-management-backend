const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Announcement = require('./models/Announcement');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User, Student, Faculty, Department, Course, Announcement].map(m => m.deleteMany({})));
  console.log('Cleared existing data');

  // Admin
  const admin = await User.create({ name: 'Admin User', email: 'admin@college.edu', password: 'admin123', role: 'admin' });

  // Departments
  const [csDept, ecDept, meDept] = await Department.create([
    { name: 'Computer Science', code: 'CS' },
    { name: 'Electronics', code: 'EC' },
    { name: 'Mechanical', code: 'ME' },
  ]);

  // Faculty
  const [f1User, f2User] = await User.create([
    { name: 'Dr. Sarah Johnson', email: 'faculty@college.edu', password: 'faculty123', role: 'faculty' },
    { name: 'Prof. Mark Wilson', email: 'mark.wilson@college.edu', password: 'faculty123', role: 'faculty' },
  ]);
  const [fac1, fac2] = await Faculty.create([
    { user: f1User._id, employeeId: 'FAC001', department: csDept._id, designation: 'Associate Professor', qualification: 'Ph.D CS', experience: 10 },
    { user: f2User._id, employeeId: 'FAC002', department: ecDept._id, designation: 'Professor', qualification: 'Ph.D EC', experience: 15 },
  ]);

  // Update dept heads
  await Department.findByIdAndUpdate(csDept._id, { head: fac1._id });
  await Department.findByIdAndUpdate(ecDept._id, { head: fac2._id });

  // Courses
  const [c1, c2, c3] = await Course.create([
    { name: 'Data Structures', code: 'CS301', department: csDept._id, faculty: fac1._id, semester: 3, credits: 4 },
    { name: 'Database Management', code: 'CS302', department: csDept._id, faculty: fac1._id, semester: 3, credits: 3 },
    { name: 'Digital Electronics', code: 'EC301', department: ecDept._id, faculty: fac2._id, semester: 3, credits: 4 },
  ]);

  // Update faculty courses
  await Faculty.findByIdAndUpdate(fac1._id, { courses: [c1._id, c2._id] });
  await Faculty.findByIdAndUpdate(fac2._id, { courses: [c3._id] });

  // Students
  const [s1User, s2User] = await User.create([
    { name: 'Alice Smith', email: 'student@college.edu', password: 'student123', role: 'student' },
    { name: 'Bob Johnson', email: 'bob.johnson@college.edu', password: 'student123', role: 'student' },
  ]);
  await Student.create([
    { user: s1User._id, rollNumber: 'CS2021001', department: csDept._id, semester: 3, courses: [c1._id, c2._id], bloodGroup: 'A+', guardianName: 'John Smith' },
    { user: s2User._id, rollNumber: 'CS2021002', department: csDept._id, semester: 3, courses: [c1._id, c2._id], bloodGroup: 'B+', guardianName: 'Mike Johnson' },
  ]);

  // Announcements
  await Announcement.create([
    { title: 'Mid-term Examinations Schedule', content: 'Mid-term exams will begin from next Monday. Please check the timetable on the notice board.', author: admin._id, priority: 'high', targetAudience: 'all' },
    { title: 'Campus Placement Drive', content: 'TCS and Infosys will be conducting campus placements next week. Eligible students should register.', author: f1User._id, priority: 'high', targetAudience: 'students' },
    { title: 'Faculty Development Program', content: 'A 3-day FDP on Modern Teaching Methodologies will be held next week.', author: admin._id, priority: 'medium', targetAudience: 'faculty' },
  ]);

  console.log('\n✅ Seed completed successfully!');
  console.log('\nDemo Accounts:');
  console.log('  Admin:   admin@college.edu / admin123');
  console.log('  Faculty: faculty@college.edu / faculty123');
  console.log('  Student: student@college.edu / student123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
