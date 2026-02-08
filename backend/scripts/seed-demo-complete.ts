#!/usr/bin/env ts-node
/**
 * 🎯 Seed Demo Complete — Kainet Tenant
 * 
 * Populates ALL collections with realistic demo data for client demonstration:
 *  - 10+ additional realistic users (students, mentors, managers)
 *  - Mentorship requests & sessions (with history)
 *  - Forum Q&A (student-mentor conversations)
 *  - Notifications for various users
 *  - Quiz attempts with scores
 *  - Activity feed (achievements, completions, badges)
 *  - User progress (enrollments at various stages)
 *  - Achievements
 *  - User groups (departments)
 *  - Course assignments
 *  - Categories
 *  - Company settings & certificate template
 *  - Certificates for completed students
 */

import { CosmosClient } from '@azure/cosmos';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT!;
const COSMOS_KEY = process.env.COSMOS_KEY!;
const DATABASE_ID = 'accesslearn-db';

const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
const db = client.database(DATABASE_ID);

const T = 'tenant-kainet'; // tenantId
const now = Date.now();
const iso = () => new Date().toISOString();

function hash(pw: string) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}
function uid() {
  return `user-${crypto.randomUUID()}`;
}
function rid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
function daysAgo(d: number) {
  return now - d * 86400000;
}
function isoAgo(d: number) {
  return new Date(daysAgo(d)).toISOString();
}

// ─── Existing user IDs (from DB query) ───
const USERS = {
  ana:      { id: 'user-90320157-b1f3-47e8-9f4e-8c8e8f6e3f77', name: 'Ana López Torres', email: 'ana.lopez@kainet.mx', role: 'super-admin' },
  carlos_c: { id: 'user-5fc935b3-2791-47f2-91d6-49e23e451910', name: 'Carlos García', email: 'carlos.content@kainet.mx', role: 'content-manager' },
  maria_i:  { id: 'user-3e5480e2-552f-4f2a-ad5b-a233aafacf8f', name: 'María Rodríguez', email: 'maria.instructor@kainet.mx', role: 'instructor' },
  juan:     { id: 'user-466cce10-28b1-4a08-945d-ac54ea197a06', name: 'Juan Pérez', email: 'juan.student@kainet.mx', role: 'student' },
  pedro:    { id: 'user-108e151a-7ecb-4950-9ab3-be761247ab39', name: 'Pedro Martínez', email: 'pedro.student@kainet.mx', role: 'student' },
  laura:    { id: 'user-06401882-fe4f-46d0-9198-3d0bed91954b', name: 'Laura González', email: 'laura.student@kainet.mx', role: 'student' },
  mentor_c: { id: 'user-d2135134-27ae-49a5-a6a6-a8f5920f9b50', name: 'Carlos Hernández', email: 'carlos.mentor@kainet.mx', role: 'mentor' },
  marco:    { id: 'user-eda8f030-f59a-4619-a4d5-7fcaa244b4b1', name: 'Marco Domínguez', email: 'marcdomibe@gmail.com', role: 'student' },
};

// ─── Course IDs ───
const COURSES = {
  c1: { id: 'course-1763874756585-mvnuozcuu', title: 'Introducción a AccessLearn' },
  c2: { id: 'course-1763874757513-me6s2vs72', title: 'Gestión de Cursos en AccessLearn' },
  c3: { id: 'course-1763874758191-ku23ii5b8', title: 'Analytics Avanzado en AccessLearn' },
};

// ═══════════════════════════════════════════════
// Helper: upsert into a container
// ═══════════════════════════════════════════════
async function upsert(containerName: string, item: any) {
  const c = db.container(containerName);
  try {
    await c.items.upsert(item);
    return true;
  } catch (e: any) {
    if (e.code === 409) {
      await c.item(item.id, item.tenantId || item.id).replace(item);
      return true;
    }
    console.error(`  ❌ Error in ${containerName}:`, e.message?.slice(0, 100));
    return false;
  }
}

async function upsertMany(containerName: string, items: any[]) {
  let ok = 0;
  for (const item of items) {
    if (await upsert(containerName, item)) ok++;
  }
  console.log(`  ✅ ${containerName}: ${ok}/${items.length} items`);
}

// ═══════════════════════════════════════════════
// 1. NEW REALISTIC USERS
// ═══════════════════════════════════════════════
const newUsersData = [
  // 5 more students with realistic Mexican names
  {
    id: uid(), email: 'sofia.ramirez@kainet.mx', firstName: 'Sofía', lastName: 'Ramírez Vega',
    role: 'student', phone: '+52 55 3421 8900', gender: 'female',
    dateOfBirth: '1995-03-15', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia-r',
  },
  {
    id: uid(), email: 'diego.torres@kainet.mx', firstName: 'Diego', lastName: 'Torres Mendoza',
    role: 'student', phone: '+52 55 7890 1234', gender: 'male',
    dateOfBirth: '1998-07-22', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diego-t',
  },
  {
    id: uid(), email: 'valentina.castro@kainet.mx', firstName: 'Valentina', lastName: 'Castro Flores',
    role: 'student', phone: '+52 55 2345 6789', gender: 'female',
    dateOfBirth: '1997-11-08', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=valentina',
  },
  {
    id: uid(), email: 'andres.morales@kainet.mx', firstName: 'Andrés', lastName: 'Morales Díaz',
    role: 'student', phone: '+52 55 5678 9012', gender: 'male',
    dateOfBirth: '1993-01-30', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andres-m',
  },
  {
    id: uid(), email: 'camila.herrera@kainet.mx', firstName: 'Camila', lastName: 'Herrera Ríos',
    role: 'student', phone: '+52 55 8901 2345', gender: 'female',
    dateOfBirth: '1999-05-12', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=camila-h',
  },
  // 2 more mentors
  {
    id: uid(), email: 'patricia.luna@kainet.mx', firstName: 'Patricia', lastName: 'Luna Contreras',
    role: 'mentor', phone: '+52 55 1122 3344', gender: 'female',
    dateOfBirth: '1988-09-20', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=patricia',
    mentorBio: 'Especialista en UX/UI con 8 años de experiencia. Apasionada por la accesibilidad web y el diseño inclusivo. Certificada en WCAG 2.1.',
    mentorSpecialties: ['UX/UI', 'Accesibilidad', 'Figma', 'Design Thinking', 'CSS'],
    mentorAvailability: { monday: ['10:00-12:00'], wednesday: ['10:00-12:00', '16:00-18:00'], friday: ['14:00-16:00'] },
    mentorRating: 4.8, totalMentorSessions: 34, totalMentees: 10, mentorIsAvailable: true,
  },
  {
    id: uid(), email: 'ricardo.navarro@kainet.mx', firstName: 'Ricardo', lastName: 'Navarro Soto',
    role: 'mentor', phone: '+52 55 5566 7788', gender: 'male',
    dateOfBirth: '1985-04-10', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ricardo-n',
    mentorBio: 'Data Engineer & Cloud Architect con 12 años en la industria. Experto en Azure, big data y pipelines de datos. Me encanta enseñar arquitectura cloud.',
    mentorSpecialties: ['Azure', 'Data Engineering', 'Python', 'SQL', 'Power BI', 'ETL'],
    mentorAvailability: { tuesday: ['09:00-11:00', '15:00-17:00'], thursday: ['09:00-11:00'] },
    mentorRating: 4.9, totalMentorSessions: 52, totalMentees: 15, mentorIsAvailable: true,
  },
  // 1 more instructor
  {
    id: uid(), email: 'elena.gutierrez@kainet.mx', firstName: 'Elena', lastName: 'Gutiérrez Paredes',
    role: 'instructor', phone: '+52 55 9988 7766', gender: 'female',
    dateOfBirth: '1990-08-05', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena-g',
  },
];

// We'll store the IDs after creation for reference
const NEW_USERS: Record<string, { id: string; name: string; email: string; role: string }> = {};

async function seedUsers() {
  console.log('\n👥 1. Creating new users...');
  const c = db.container('users');

  for (const u of newUsersData) {
    const user: any = {
      ...u,
      tenantId: T,
      password: hash('Demo123!'),
      status: 'active',
      passwordResetRequired: false,
      enrolledCourses: [],
      completedCourses: [],
      totalXP: 0,
      level: 1,
      badges: [],
      createdAt: isoAgo(Math.floor(Math.random() * 30) + 15), // 15-45 days ago
      updatedAt: iso(),
      lastLoginAt: isoAgo(Math.floor(Math.random() * 3)),
    };

    try {
      await c.items.upsert(user);
      NEW_USERS[u.email] = { id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email, role: u.role };
      console.log(`  ✅ ${u.role.padEnd(12)} ${u.email}`);
    } catch (e: any) {
      if (e.code === 409) {
        // Already exists — fetch existing
        const { resources } = await c.items.query({
          query: 'SELECT c.id, c.email, c.firstName, c.lastName, c.role FROM c WHERE c.tenantId = @t AND c.email = @e',
          parameters: [{ name: '@t', value: T }, { name: '@e', value: u.email }],
        }).fetchAll();
        if (resources.length > 0) {
          const r = resources[0];
          NEW_USERS[u.email] = { id: r.id, name: `${r.firstName} ${r.lastName}`, email: r.email, role: r.role };
          console.log(`  ℹ️  exists     ${u.email}`);
        }
      } else {
        console.error(`  ❌ ${u.email}: ${e.message?.slice(0, 80)}`);
      }
    }
  }
}

// ═══════════════════════════════════════════════
// 2. COMPANY SETTINGS
// ═══════════════════════════════════════════════
async function seedCompanySettings() {
  console.log('\n🏢 2. Company settings...');
  await upsertMany('company-settings', [{
    id: `company-settings-${T}`,
    tenantId: T,
    companyName: 'Kainet Technologies',
    companyLogo: '',
    createdAt: isoAgo(60),
    updatedAt: iso(),
  }]);
}

// ═══════════════════════════════════════════════
// 3. CATEGORIES
// ═══════════════════════════════════════════════
async function seedCategories() {
  console.log('\n📂 3. Categories...');
  const cats = [
    { name: 'Onboarding', desc: 'Cursos de inducción y bienvenida' },
    { name: 'Tecnología', desc: 'Desarrollo de software, cloud, DevOps' },
    { name: 'Liderazgo', desc: 'Habilidades de gestión y liderazgo' },
    { name: 'Cumplimiento Normativo', desc: 'NOM-035, protección de datos, ética' },
    { name: 'Habilidades Blandas', desc: 'Comunicación, trabajo en equipo, presentaciones' },
    { name: 'Accesibilidad e Inclusión', desc: 'WCAG, diseño inclusivo, accesibilidad digital' },
    { name: 'Analytics y Datos', desc: 'Análisis de datos, visualización, reportes' },
    { name: 'Ventas', desc: 'Técnicas de venta, CRM, atención al cliente' },
  ];

  await upsertMany('categories', cats.map((c, i) => ({
    id: `cat-${i + 1}`,
    tenantId: T,
    name: c.name,
    description: c.desc,
    createdBy: USERS.ana.id,
    createdAt: isoAgo(45),
    updatedAt: iso(),
  })));
}

// ═══════════════════════════════════════════════
// 4. USER GROUPS (Departments)
// ═══════════════════════════════════════════════
async function seedGroups() {
  console.log('\n👥 4. User groups (departments)...');

  const allStudents = [
    USERS.juan.id, USERS.pedro.id, USERS.laura.id, USERS.marco.id,
    ...Object.values(NEW_USERS).filter(u => u.role === 'student').map(u => u.id),
  ];
  const allMentors = [
    USERS.mentor_c.id,
    ...Object.values(NEW_USERS).filter(u => u.role === 'mentor').map(u => u.id),
  ];

  const groups = [
    {
      id: 'group-engineering', name: 'Ingeniería', description: 'Equipo de desarrollo de software y DevOps',
      memberIds: [allStudents[0], allStudents[1], allStudents[4], allStudents[5], allMentors[0]],
    },
    {
      id: 'group-product', name: 'Producto y Diseño', description: 'Equipo de producto, UX/UI y diseño',
      memberIds: [allStudents[2], allStudents[3], allStudents[6]],
    },
    {
      id: 'group-operations', name: 'Operaciones', description: 'Equipo de operaciones y soporte',
      memberIds: [allStudents[0], allStudents[2], allStudents[7] || allStudents[3]],
    },
    {
      id: 'group-leadership', name: 'Liderazgo', description: 'Managers y líderes de equipo',
      memberIds: [USERS.ana.id, USERS.carlos_c.id, USERS.maria_i.id],
    },
  ].map(g => ({
    ...g,
    tenantId: T,
    createdBy: USERS.ana.id,
    createdAt: isoAgo(40),
    updatedAt: iso(),
  }));

  await upsertMany('user-groups', groups);
}

// ═══════════════════════════════════════════════
// 5. COURSE ASSIGNMENTS
// ═══════════════════════════════════════════════
async function seedAssignments() {
  console.log('\n📋 5. Course assignments...');

  const allStudentIds = [
    USERS.juan.id, USERS.pedro.id, USERS.laura.id, USERS.marco.id,
    ...Object.values(NEW_USERS).filter(u => u.role === 'student').map(u => u.id),
  ];

  const assignments: any[] = [];

  // Assign Course 1 (Intro) to all students
  for (const sid of allStudentIds) {
    assignments.push({
      id: rid('assign'),
      tenantId: T,
      courseId: COURSES.c1.id,
      assignedToType: 'user',
      assignedToId: sid,
      assignedBy: USERS.ana.id,
      dueDate: isoAgo(-30), // 30 days from now
      status: 'in-progress',
      createdAt: isoAgo(25),
      updatedAt: iso(),
    });
  }

  // Assign Course 2 (Gestión) to some students
  for (const sid of allStudentIds.slice(0, 5)) {
    assignments.push({
      id: rid('assign'),
      tenantId: T,
      courseId: COURSES.c2.id,
      assignedToType: 'user',
      assignedToId: sid,
      assignedBy: USERS.ana.id,
      dueDate: isoAgo(-45),
      status: 'pending',
      createdAt: isoAgo(20),
      updatedAt: iso(),
    });
  }

  // Assign Course 3 (Analytics) to leadership group
  assignments.push({
    id: rid('assign'),
    tenantId: T,
    courseId: COURSES.c3.id,
    assignedToType: 'group',
    assignedToId: 'group-leadership',
    assignedBy: USERS.ana.id,
    dueDate: isoAgo(-60),
    status: 'pending',
    createdAt: isoAgo(15),
    updatedAt: iso(),
  });

  await upsertMany('course-assignments', assignments);
}

// ═══════════════════════════════════════════════
// 6. USER PROGRESS
// ═══════════════════════════════════════════════
async function seedProgress() {
  console.log('\n📊 6. User progress...');

  // Course 1 module IDs (from actual course data)
  const c1Lessons = ['lesson-welcome-100', 'lesson-inscripcion-200', 'lesson-nav-300', 'lesson-quiz-400', 'lesson-xp-500', 'lesson-a11y-600'];
  const c2Lessons = ['lesson-editor-100', 'lesson-config-200', 'lesson-contenido-300', 'lesson-quizzes-400', 'lesson-publish-500'];

  const progress: any[] = [
    // Juan — completed Course 1 (100%)
    {
      id: `progress-${USERS.juan.id}-${COURSES.c1.id}`,
      userId: USERS.juan.id, tenantId: T, courseId: COURSES.c1.id,
      status: 'completed', progress: 100,
      completedLessons: c1Lessons,
      quizScores: [{ quizId: 'quiz-welcome-q1', score: 90, attempts: 1, completedAt: isoAgo(10) }],
      certificateEarned: true, bestScore: 90, totalXpEarned: 500, currentAttempt: 1, attempts: [],
      lastAccessedAt: isoAgo(5),
    },
    // Juan — in-progress Course 2 (60%)
    {
      id: `progress-${USERS.juan.id}-${COURSES.c2.id}`,
      userId: USERS.juan.id, tenantId: T, courseId: COURSES.c2.id,
      status: 'in-progress', progress: 60,
      completedLessons: c2Lessons.slice(0, 3),
      quizScores: [], certificateEarned: false, bestScore: 0, totalXpEarned: 180, currentAttempt: 1, attempts: [],
      lastAccessedAt: isoAgo(2),
    },
    // Pedro — in-progress Course 1 (50%)
    {
      id: `progress-${USERS.pedro.id}-${COURSES.c1.id}`,
      userId: USERS.pedro.id, tenantId: T, courseId: COURSES.c1.id,
      status: 'in-progress', progress: 50,
      completedLessons: c1Lessons.slice(0, 3),
      quizScores: [], certificateEarned: false, bestScore: 0, totalXpEarned: 150, currentAttempt: 1, attempts: [],
      lastAccessedAt: isoAgo(3),
    },
    // Laura — completed Course 1 (100%)
    {
      id: `progress-${USERS.laura.id}-${COURSES.c1.id}`,
      userId: USERS.laura.id, tenantId: T, courseId: COURSES.c1.id,
      status: 'completed', progress: 100,
      completedLessons: c1Lessons,
      quizScores: [{ quizId: 'quiz-welcome-q1', score: 85, attempts: 2, completedAt: isoAgo(8) }],
      certificateEarned: true, bestScore: 85, totalXpEarned: 500, currentAttempt: 1, attempts: [],
      lastAccessedAt: isoAgo(4),
    },
    // Laura — in-progress Course 2 (40%)
    {
      id: `progress-${USERS.laura.id}-${COURSES.c2.id}`,
      userId: USERS.laura.id, tenantId: T, courseId: COURSES.c2.id,
      status: 'in-progress', progress: 40,
      completedLessons: c2Lessons.slice(0, 2),
      quizScores: [], certificateEarned: false, bestScore: 0, totalXpEarned: 120, currentAttempt: 1, attempts: [],
      lastAccessedAt: isoAgo(1),
    },
    // Marco — in-progress Course 1 (83%)
    {
      id: `progress-${USERS.marco.id}-${COURSES.c1.id}`,
      userId: USERS.marco.id, tenantId: T, courseId: COURSES.c1.id,
      status: 'in-progress', progress: 83,
      completedLessons: c1Lessons.slice(0, 5),
      quizScores: [{ quizId: 'quiz-welcome-q1', score: 95, attempts: 1, completedAt: isoAgo(6) }],
      certificateEarned: false, bestScore: 95, totalXpEarned: 400, currentAttempt: 1, attempts: [],
      lastAccessedAt: isoAgo(1),
    },
  ];

  // Add progress for new students
  const newStudents = Object.values(NEW_USERS).filter(u => u.role === 'student');
  for (let i = 0; i < newStudents.length; i++) {
    const s = newStudents[i];
    const pct = [70, 30, 90, 45, 65][i] || 50;
    const lessonsCompleted = c1Lessons.slice(0, Math.floor(c1Lessons.length * pct / 100));
    progress.push({
      id: `progress-${s.id}-${COURSES.c1.id}`,
      userId: s.id, tenantId: T, courseId: COURSES.c1.id,
      status: pct >= 100 ? 'completed' : 'in-progress', progress: pct,
      completedLessons: lessonsCompleted,
      quizScores: pct >= 60 ? [{ quizId: 'quiz-welcome-q1', score: 70 + i * 5, attempts: 1, completedAt: isoAgo(7 - i) }] : [],
      certificateEarned: pct >= 100, bestScore: pct >= 60 ? 70 + i * 5 : 0,
      totalXpEarned: Math.floor(pct * 5), currentAttempt: 1, attempts: [],
      lastAccessedAt: isoAgo(i + 1),
    });
  }

  await upsertMany('user-progress', progress);

  // Also update user XP in the users container
  console.log('  Updating user XP totals...');
  const usersC = db.container('users');
  const xpMap: Record<string, number> = {
    [USERS.juan.id]: 680,
    [USERS.pedro.id]: 150,
    [USERS.laura.id]: 620,
    [USERS.marco.id]: 400,
  };
  for (const [userId, xp] of Object.entries(xpMap)) {
    try {
      const { resource } = await usersC.item(userId, T).read();
      if (resource) {
        await usersC.item(userId, T).replace({
          ...resource,
          totalXP: xp,
          level: xp >= 600 ? 3 : xp >= 300 ? 2 : 1,
          updatedAt: iso(),
        });
      }
    } catch {}
  }
}

// ═══════════════════════════════════════════════
// 7. MENTORSHIP REQUESTS
// ═══════════════════════════════════════════════
async function seedMentorshipRequests() {
  console.log('\n🤝 7. Mentorship requests...');

  const mentorPatricia = Object.values(NEW_USERS).find(u => u.email === 'patricia.luna@kainet.mx');
  const mentorRicardo = Object.values(NEW_USERS).find(u => u.email === 'ricardo.navarro@kainet.mx');

  const requests = [
    // Accepted requests (became sessions)
    {
      id: 'mentorship-req-001', tenantId: T,
      menteeId: USERS.juan.id, menteeName: USERS.juan.name, menteeEmail: USERS.juan.email,
      mentorId: USERS.mentor_c.id, mentorName: USERS.mentor_c.name, mentorEmail: USERS.mentor_c.email,
      topic: 'Cómo avanzar a roles de liderazgo técnico',
      message: 'Hola Carlos, me gustaría hablar sobre cómo hacer la transición de developer a tech lead. Tengo 3 años de experiencia y quiero crecer.',
      status: 'accepted' as const,
      createdAt: daysAgo(20), respondedAt: daysAgo(19),
    },
    {
      id: 'mentorship-req-002', tenantId: T,
      menteeId: USERS.laura.id, menteeName: USERS.laura.name, menteeEmail: USERS.laura.email,
      mentorId: mentorPatricia?.id || USERS.mentor_c.id,
      mentorName: mentorPatricia?.name || USERS.mentor_c.name,
      mentorEmail: mentorPatricia?.email || USERS.mentor_c.email,
      topic: 'Mejorar mis habilidades de diseño accesible',
      message: 'Patricia, estoy trabajando en un proyecto de accesibilidad y me encantaría recibir tu mentoría sobre WCAG y diseño inclusivo.',
      status: 'accepted' as const,
      createdAt: daysAgo(15), respondedAt: daysAgo(14),
    },
    {
      id: 'mentorship-req-003', tenantId: T,
      menteeId: USERS.pedro.id, menteeName: USERS.pedro.name, menteeEmail: USERS.pedro.email,
      mentorId: mentorRicardo?.id || USERS.mentor_c.id,
      mentorName: mentorRicardo?.name || USERS.mentor_c.name,
      mentorEmail: mentorRicardo?.email || USERS.mentor_c.email,
      topic: 'Aprender Azure y cloud computing',
      message: 'Ricardo, quiero empezar a aprender sobre cloud. ¿Podrías orientarme en Azure fundamentals?',
      status: 'accepted' as const,
      createdAt: daysAgo(12), respondedAt: daysAgo(11),
    },
    // Pending requests
    {
      id: 'mentorship-req-004', tenantId: T,
      menteeId: USERS.marco.id, menteeName: USERS.marco.name, menteeEmail: USERS.marco.email,
      mentorId: USERS.mentor_c.id, mentorName: USERS.mentor_c.name, mentorEmail: USERS.mentor_c.email,
      topic: 'Revisión de portafolio y carrera en tech',
      message: 'Carlos, estoy buscando consejos sobre cómo mejorar mi portafolio y preparar entrevistas técnicas.',
      status: 'pending' as const,
      createdAt: daysAgo(2),
    },
    {
      id: 'mentorship-req-005', tenantId: T,
      menteeId: Object.values(NEW_USERS).find(u => u.email === 'sofia.ramirez@kainet.mx')?.id || USERS.juan.id,
      menteeName: 'Sofía Ramírez Vega',
      menteeEmail: 'sofia.ramirez@kainet.mx',
      mentorId: mentorPatricia?.id || USERS.mentor_c.id,
      mentorName: mentorPatricia?.name || 'Patricia Luna Contreras',
      mentorEmail: mentorPatricia?.email || 'patricia.luna@kainet.mx',
      topic: 'Introducción a UX Research',
      message: 'Patricia, me interesa mucho el UX Research. ¿Podrías guiarme en cómo empezar?',
      status: 'pending' as const,
      createdAt: daysAgo(1),
    },
    // Completed (with feedback)
    {
      id: 'mentorship-req-006', tenantId: T,
      menteeId: USERS.laura.id, menteeName: USERS.laura.name, menteeEmail: USERS.laura.email,
      mentorId: USERS.mentor_c.id, mentorName: USERS.mentor_c.name, mentorEmail: USERS.mentor_c.email,
      topic: 'Fundamentos de programación en JavaScript',
      message: 'Carlos, soy nueva en programación y necesito ayuda con los fundamentos de JavaScript.',
      status: 'accepted' as const,
      createdAt: daysAgo(35), respondedAt: daysAgo(34),
    },
  ];

  await upsertMany('mentorship-requests', requests);
}

// ═══════════════════════════════════════════════
// 8. MENTORSHIP SESSIONS
// ═══════════════════════════════════════════════
async function seedMentorshipSessions() {
  console.log('\n📅 8. Mentorship sessions...');

  const mentorPatricia = Object.values(NEW_USERS).find(u => u.email === 'patricia.luna@kainet.mx');
  const mentorRicardo = Object.values(NEW_USERS).find(u => u.email === 'ricardo.navarro@kainet.mx');

  const sessions = [
    // Completed sessions
    {
      id: 'session-001', tenantId: T, requestId: 'mentorship-req-006',
      mentorId: USERS.mentor_c.id, mentorName: USERS.mentor_c.name,
      menteeId: USERS.laura.id, menteeName: USERS.laura.name,
      topic: 'Fundamentos de programación en JavaScript',
      scheduledDate: daysAgo(30), duration: 60, status: 'completed',
      notes: 'Revisamos variables, tipos de datos, funciones y scope. Laura muestra buen progreso. Tarea: completar ejercicios de arrays y objetos.',
      sharedResources: ['https://developer.mozilla.org/es/docs/Web/JavaScript/Guide', 'https://javascript.info/'],
      rating: 5, feedback: '¡Excelente sesión! Carlos explica muy claro y con paciencia. Aprendí mucho sobre funciones.',
      completedAt: daysAgo(30), createdAt: daysAgo(32), xpAwarded: true,
    },
    {
      id: 'session-002', tenantId: T, requestId: 'mentorship-req-001',
      mentorId: USERS.mentor_c.id, mentorName: USERS.mentor_c.name,
      menteeId: USERS.juan.id, menteeName: USERS.juan.name,
      topic: 'Cómo avanzar a roles de liderazgo técnico',
      scheduledDate: daysAgo(15), duration: 45, status: 'completed',
      notes: 'Discutimos la diferencia entre IC y TL. Hablamos del framework STAR para entrevistas. Juan necesita practicar comunicación de decisiones técnicas.',
      sharedResources: ['https://staffeng.com/guides/'],
      rating: 5, feedback: 'Muy buena sesión. Me dio clarity sobre el path a tech lead.',
      completedAt: daysAgo(15), createdAt: daysAgo(18), xpAwarded: true,
    },
    {
      id: 'session-003', tenantId: T, requestId: 'mentorship-req-002',
      mentorId: mentorPatricia?.id || USERS.mentor_c.id,
      mentorName: mentorPatricia?.name || 'Patricia Luna',
      menteeId: USERS.laura.id, menteeName: USERS.laura.name,
      topic: 'Mejorar mis habilidades de diseño accesible',
      scheduledDate: daysAgo(10), duration: 60, status: 'completed',
      notes: 'Revisamos los 4 principios de WCAG (Perceivable, Operable, Understandable, Robust). Practicamos auditoría de accesibilidad con axe DevTools.',
      sharedResources: ['https://www.w3.org/WAI/WCAG21/quickref/', 'https://www.deque.com/axe/'],
      rating: 4, feedback: 'Aprendí mucho sobre WCAG. Patricia es muy paciente y detallada.',
      completedAt: daysAgo(10), createdAt: daysAgo(13), xpAwarded: true,
    },
    // Scheduled (upcoming) sessions
    {
      id: 'session-004', tenantId: T, requestId: 'mentorship-req-001',
      mentorId: USERS.mentor_c.id, mentorName: USERS.mentor_c.name,
      menteeId: USERS.juan.id, menteeName: USERS.juan.name,
      topic: 'Seguimiento: Preparación para entrevista de TL',
      scheduledDate: daysAgo(-3), // 3 days in the future
      duration: 45, status: 'scheduled',
      notes: '', createdAt: daysAgo(2),
    },
    {
      id: 'session-005', tenantId: T, requestId: 'mentorship-req-003',
      mentorId: mentorRicardo?.id || USERS.mentor_c.id,
      mentorName: mentorRicardo?.name || 'Ricardo Navarro',
      menteeId: USERS.pedro.id, menteeName: USERS.pedro.name,
      topic: 'Azure Fundamentals — Primera sesión',
      scheduledDate: daysAgo(-5), // 5 days in the future
      duration: 60, status: 'scheduled',
      notes: '', createdAt: daysAgo(3),
    },
    {
      id: 'session-006', tenantId: T, requestId: 'mentorship-req-002',
      mentorId: mentorPatricia?.id || USERS.mentor_c.id,
      mentorName: mentorPatricia?.name || 'Patricia Luna',
      menteeId: USERS.laura.id, menteeName: USERS.laura.name,
      topic: 'Seguimiento: Auditoría WCAG de proyecto real',
      scheduledDate: daysAgo(-7), // 7 days in the future
      duration: 60, status: 'scheduled',
      notes: '', createdAt: daysAgo(1),
    },
  ];

  await upsertMany('mentorship-sessions', sessions);
}

// ═══════════════════════════════════════════════
// 9. FORUM QUESTIONS & ANSWERS
// ═══════════════════════════════════════════════
async function seedForums() {
  console.log('\n💬 9. Forum Q&A...');

  const items: any[] = [];

  // Q1 — Course 1
  items.push({
    id: 'forum-q-001', type: 'question',
    tenantId: T, courseId: COURSES.c1.id, moduleId: 'mod-bienvenida',
    userId: USERS.juan.id, userName: USERS.juan.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
    title: '¿Cómo puedo ver mi progreso en el dashboard?',
    content: 'Hola, acabo de empezar el curso y no encuentro dónde ver el porcentaje de avance. ¿Alguien me puede orientar?',
    timestamp: daysAgo(18), upvotes: 3, upvotedBy: [USERS.pedro.id, USERS.laura.id, USERS.marco.id],
    answered: true, createdAt: isoAgo(18), updatedAt: isoAgo(17),
  });
  items.push({
    id: 'forum-a-001', type: 'answer',
    tenantId: T, questionId: 'forum-q-001',
    userId: USERS.maria_i.id, userName: USERS.maria_i.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    content: '¡Hola Juan! Tu progreso aparece en la sección "Mi Biblioteca" del dashboard. Verás una barra de progreso debajo de cada curso inscrito. También puedes ver el detalle entrando al curso.',
    timestamp: daysAgo(17), upvotes: 5, upvotedBy: [USERS.juan.id, USERS.pedro.id, USERS.laura.id, USERS.marco.id, USERS.ana.id],
    isBestAnswer: true, createdAt: isoAgo(17), updatedAt: isoAgo(17),
  });
  items.push({
    id: 'forum-a-001b', type: 'answer',
    tenantId: T, questionId: 'forum-q-001',
    userId: USERS.laura.id, userName: USERS.laura.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura',
    content: 'También puedes usar el atajo del teclado Ctrl+D para ir directo al dashboard, ¡muy útil!',
    timestamp: daysAgo(16), upvotes: 2, upvotedBy: [USERS.juan.id, USERS.pedro.id],
    isBestAnswer: false, createdAt: isoAgo(16), updatedAt: isoAgo(16),
  });

  // Q2 — Course 1 
  items.push({
    id: 'forum-q-002', type: 'question',
    tenantId: T, courseId: COURSES.c1.id, moduleId: 'mod-quizzes',
    userId: USERS.pedro.id, userName: USERS.pedro.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    title: '¿Puedo reintentar un quiz si no paso?',
    content: 'Tengo una duda: si no alcanzo la puntuación mínima en un quiz, ¿puedo volver a intentarlo? ¿Cuántas veces?',
    timestamp: daysAgo(14), upvotes: 6, upvotedBy: [USERS.juan.id, USERS.laura.id, USERS.marco.id, USERS.ana.id, USERS.carlos_c.id, USERS.maria_i.id],
    answered: true, createdAt: isoAgo(14), updatedAt: isoAgo(13),
  });
  items.push({
    id: 'forum-a-002', type: 'answer',
    tenantId: T, questionId: 'forum-q-002',
    userId: USERS.carlos_c.id, userName: USERS.carlos_c.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    content: 'Sí Pedro, puedes reintentar los quizzes. El número de intentos depende de cómo configuró el instructor el curso. Por defecto son intentos ilimitados, y siempre se guarda tu mejor puntuación.',
    timestamp: daysAgo(13), upvotes: 4, upvotedBy: [USERS.pedro.id, USERS.juan.id, USERS.laura.id, USERS.marco.id],
    isBestAnswer: true, createdAt: isoAgo(13), updatedAt: isoAgo(13),
  });

  // Q3 — Course 2
  items.push({
    id: 'forum-q-003', type: 'question',
    tenantId: T, courseId: COURSES.c2.id, moduleId: 'mod-editor',
    userId: USERS.laura.id, userName: USERS.laura.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura',
    title: '¿Cómo usar la IA para generar contenido del curso?',
    content: 'Vi que hay una opción de IA en el editor de contenido. ¿Cómo funciona? ¿Qué tipo de contenido puede generar?',
    timestamp: daysAgo(10), upvotes: 8,
    upvotedBy: [USERS.juan.id, USERS.pedro.id, USERS.marco.id, USERS.ana.id, USERS.carlos_c.id, USERS.maria_i.id, USERS.mentor_c.id, USERS.laura.id],
    answered: true, createdAt: isoAgo(10), updatedAt: isoAgo(9),
  });
  items.push({
    id: 'forum-a-003', type: 'answer',
    tenantId: T, questionId: 'forum-q-003',
    userId: USERS.maria_i.id, userName: USERS.maria_i.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    content: '¡Excelente pregunta! La IA de AccessLearn puede generar:\n\n1. **Contenido de lecciones**: Textos, explicaciones y resúmenes sobre cualquier tema\n2. **Quizzes**: Preguntas de opción múltiple, verdadero/falso, y más\n3. **Resúmenes**: De documentos que subas (PDF, etc.)\n\nPara usarla, ve al editor de contenido y haz clic en el botón "✨ Crear con IA". Escribe un tema y la IA generará el contenido que puedes editar.',
    timestamp: daysAgo(9), upvotes: 6,
    upvotedBy: [USERS.laura.id, USERS.juan.id, USERS.pedro.id, USERS.marco.id, USERS.ana.id, USERS.mentor_c.id],
    isBestAnswer: true, createdAt: isoAgo(9), updatedAt: isoAgo(9),
  });

  // Q4 — Course 3
  items.push({
    id: 'forum-q-004', type: 'question',
    tenantId: T, courseId: COURSES.c3.id, moduleId: 'mod-analytics',
    userId: USERS.ana.id, userName: USERS.ana.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    title: '¿Se pueden exportar los reportes de analytics?',
    content: 'Como administradora, necesito compartir los reportes de progreso con dirección. ¿Hay forma de exportarlos a PDF o Excel?',
    timestamp: daysAgo(7), upvotes: 4,
    upvotedBy: [USERS.carlos_c.id, USERS.maria_i.id, USERS.mentor_c.id, USERS.marco.id],
    answered: true, createdAt: isoAgo(7), updatedAt: isoAgo(6),
  });
  items.push({
    id: 'forum-a-004', type: 'answer',
    tenantId: T, questionId: 'forum-q-004',
    userId: USERS.carlos_c.id, userName: USERS.carlos_c.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    content: 'Ana, actualmente puedes ver los datos directamente en el Dashboard de Analytics. La función de exportación a CSV está en el roadmap para la próxima versión. Por ahora puedes usar Print to PDF del navegador.',
    timestamp: daysAgo(6), upvotes: 3,
    upvotedBy: [USERS.ana.id, USERS.maria_i.id, USERS.mentor_c.id],
    isBestAnswer: true, createdAt: isoAgo(6), updatedAt: isoAgo(6),
  });

  // Q5 — General discussion
  items.push({
    id: 'forum-q-005', type: 'question',
    tenantId: T, courseId: COURSES.c1.id, moduleId: 'mod-gamificacion',
    userId: USERS.marco.id, userName: USERS.marco.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco',
    title: '¿Cómo funciona el sistema de XP y niveles?',
    content: 'He notado que gano XP al completar lecciones. ¿Cuántos niveles hay? ¿Hay recompensas por subir de nivel?',
    timestamp: daysAgo(5), upvotes: 7,
    upvotedBy: [USERS.juan.id, USERS.pedro.id, USERS.laura.id, USERS.ana.id, USERS.carlos_c.id, USERS.maria_i.id, USERS.mentor_c.id],
    answered: false, createdAt: isoAgo(5), updatedAt: isoAgo(5),
  });

  await upsertMany('forums', items);
}

// ═══════════════════════════════════════════════
// 10. QUIZ ATTEMPTS
// ═══════════════════════════════════════════════
async function seedQuizAttempts() {
  console.log('\n📝 10. Quiz attempts...');

  const attempts = [
    // Juan — Course 1 Quiz
    {
      id: 'qa-001', tenantId: T, userId: USERS.juan.id,
      courseId: COURSES.c1.id, quizId: 'quiz-welcome-q1', score: 90,
      answers: [
        { questionId: 'q1', selectedAnswer: 1, correct: true },
        { questionId: 'q2', selectedAnswer: 0, correct: true },
        { questionId: 'q3', selectedAnswer: 2, correct: false },
        { questionId: 'q4', selectedAnswer: 1, correct: true },
        { questionId: 'q5', selectedAnswer: 0, correct: true },
      ],
      completedAt: daysAgo(12), createdAt: isoAgo(12), updatedAt: isoAgo(12),
    },
    // Laura — Course 1 Quiz (attempt 1: 60%)
    {
      id: 'qa-002', tenantId: T, userId: USERS.laura.id,
      courseId: COURSES.c1.id, quizId: 'quiz-welcome-q1', score: 60,
      answers: [
        { questionId: 'q1', selectedAnswer: 1, correct: true },
        { questionId: 'q2', selectedAnswer: 2, correct: false },
        { questionId: 'q3', selectedAnswer: 1, correct: false },
        { questionId: 'q4', selectedAnswer: 1, correct: true },
        { questionId: 'q5', selectedAnswer: 0, correct: true },
      ],
      completedAt: daysAgo(10), createdAt: isoAgo(10), updatedAt: isoAgo(10),
    },
    // Laura — Course 1 Quiz (attempt 2: 85%)
    {
      id: 'qa-003', tenantId: T, userId: USERS.laura.id,
      courseId: COURSES.c1.id, quizId: 'quiz-welcome-q1', score: 85,
      answers: [
        { questionId: 'q1', selectedAnswer: 1, correct: true },
        { questionId: 'q2', selectedAnswer: 0, correct: true },
        { questionId: 'q3', selectedAnswer: 2, correct: false },
        { questionId: 'q4', selectedAnswer: 1, correct: true },
        { questionId: 'q5', selectedAnswer: 0, correct: true },
      ],
      completedAt: daysAgo(9), createdAt: isoAgo(9), updatedAt: isoAgo(9),
    },
    // Marco — Course 1 Quiz
    {
      id: 'qa-004', tenantId: T, userId: USERS.marco.id,
      courseId: COURSES.c1.id, quizId: 'quiz-welcome-q1', score: 95,
      answers: [
        { questionId: 'q1', selectedAnswer: 1, correct: true },
        { questionId: 'q2', selectedAnswer: 0, correct: true },
        { questionId: 'q3', selectedAnswer: 1, correct: true },
        { questionId: 'q4', selectedAnswer: 1, correct: true },
        { questionId: 'q5', selectedAnswer: 2, correct: false },
      ],
      completedAt: daysAgo(7), createdAt: isoAgo(7), updatedAt: isoAgo(7),
    },
    // Pedro — incomplete attempt
    {
      id: 'qa-005', tenantId: T, userId: USERS.pedro.id,
      courseId: COURSES.c1.id, quizId: 'quiz-welcome-q1', score: 40,
      answers: [
        { questionId: 'q1', selectedAnswer: 1, correct: true },
        { questionId: 'q2', selectedAnswer: 3, correct: false },
        { questionId: 'q3', selectedAnswer: 0, correct: false },
        { questionId: 'q4', selectedAnswer: 2, correct: false },
        { questionId: 'q5', selectedAnswer: 0, correct: true },
      ],
      completedAt: daysAgo(8), createdAt: isoAgo(8), updatedAt: isoAgo(8),
    },
  ];

  await upsertMany('quiz-attempts', attempts);
}

// ═══════════════════════════════════════════════
// 11. CERTIFICATES
// ═══════════════════════════════════════════════
async function seedCertificates() {
  console.log('\n🎓 11. Certificates...');

  const certs = [
    {
      id: 'cert-001', tenantId: T,
      userId: USERS.juan.id, courseId: COURSES.c1.id,
      courseTitle: COURSES.c1.title, completionDate: isoAgo(10),
      certificateCode: 'CERT-AL-8F3K2M',
      userFullName: USERS.juan.name, issuedBy: USERS.ana.name,
      createdAt: isoAgo(10), updatedAt: isoAgo(10),
    },
    {
      id: 'cert-002', tenantId: T,
      userId: USERS.laura.id, courseId: COURSES.c1.id,
      courseTitle: COURSES.c1.title, completionDate: isoAgo(8),
      certificateCode: 'CERT-AL-9G4L3N',
      userFullName: USERS.laura.name, issuedBy: USERS.ana.name,
      createdAt: isoAgo(8), updatedAt: isoAgo(8),
    },
  ];

  await upsertMany('certificates', certs);
}

// ═══════════════════════════════════════════════
// 12. CERTIFICATE TEMPLATE
// ═══════════════════════════════════════════════
async function seedCertificateTemplate() {
  console.log('\n📜 12. Certificate template...');

  await upsertMany('certificate-templates', [{
    id: `cert-template-${T}`,
    tenantId: T,
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    textColor: '#1F2937',
    secondaryTextColor: '#6B7280',
    titleFont: 'Georgia',
    nameFont: 'Playfair Display',
    bodyFont: 'Inter',
    titleFontSize: 32,
    nameFontSize: 28,
    bodyFontSize: 14,
    borderWidth: 3,
    borderStyle: 'gradient',
    showDecorativeGradient: true,
    logoSize: 80,
    certificateTitle: 'Certificado de Completitud',
    awardedToText: 'Se otorga a',
    completionText: 'por completar exitosamente el curso',
    signatureText: 'Kainet Technologies — AccessLearn',
    createdAt: isoAgo(45),
    updatedAt: iso(),
  }]);
}

// ═══════════════════════════════════════════════
// 13. ACHIEVEMENTS
// ═══════════════════════════════════════════════
async function seedAchievements() {
  console.log('\n🏆 13. Achievements...');

  const achievements = [
    // Juan
    { id: 'ach-001', tenantId: T, userId: USERS.juan.id, achievementId: 'first-course-completed', unlockedAt: daysAgo(10), createdAt: isoAgo(10), updatedAt: isoAgo(10) },
    { id: 'ach-002', tenantId: T, userId: USERS.juan.id, achievementId: 'quiz-perfectionist', unlockedAt: daysAgo(12), createdAt: isoAgo(12), updatedAt: isoAgo(12) },
    { id: 'ach-003', tenantId: T, userId: USERS.juan.id, achievementId: 'xp-collector-500', unlockedAt: daysAgo(10), createdAt: isoAgo(10), updatedAt: isoAgo(10) },
    { id: 'ach-004', tenantId: T, userId: USERS.juan.id, achievementId: 'first-mentorship', unlockedAt: daysAgo(15), createdAt: isoAgo(15), updatedAt: isoAgo(15) },
    // Laura
    { id: 'ach-005', tenantId: T, userId: USERS.laura.id, achievementId: 'first-course-completed', unlockedAt: daysAgo(8), createdAt: isoAgo(8), updatedAt: isoAgo(8) },
    { id: 'ach-006', tenantId: T, userId: USERS.laura.id, achievementId: 'forum-contributor', unlockedAt: daysAgo(10), createdAt: isoAgo(10), updatedAt: isoAgo(10) },
    { id: 'ach-007', tenantId: T, userId: USERS.laura.id, achievementId: 'first-mentorship', unlockedAt: daysAgo(12), createdAt: isoAgo(12), updatedAt: isoAgo(12) },
    // Pedro
    { id: 'ach-008', tenantId: T, userId: USERS.pedro.id, achievementId: 'first-lesson-completed', unlockedAt: daysAgo(14), createdAt: isoAgo(14), updatedAt: isoAgo(14) },
    // Marco
    { id: 'ach-009', tenantId: T, userId: USERS.marco.id, achievementId: 'quiz-perfectionist', unlockedAt: daysAgo(7), createdAt: isoAgo(7), updatedAt: isoAgo(7) },
    { id: 'ach-010', tenantId: T, userId: USERS.marco.id, achievementId: 'xp-collector-300', unlockedAt: daysAgo(5), createdAt: isoAgo(5), updatedAt: isoAgo(5) },
  ];

  await upsertMany('achievements', achievements);
}

// ═══════════════════════════════════════════════
// 14. ACTIVITY FEED
// ═══════════════════════════════════════════════
async function seedActivityFeed() {
  console.log('\n📱 14. Activity feed...');

  const feed = [
    // Juan completed course
    {
      id: 'feed-001', tenantId: T,
      userId: USERS.juan.id, userName: USERS.juan.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
      type: 'course-completed', timestamp: daysAgo(10),
      data: { courseName: COURSES.c1.title },
      reactions: [
        { id: 'r1', userId: USERS.laura.id, userName: USERS.laura.name, type: 'congrats', timestamp: daysAgo(10) },
        { id: 'r2', userId: USERS.pedro.id, userName: USERS.pedro.name, type: 'highfive', timestamp: daysAgo(10) },
        { id: 'r3', userId: USERS.maria_i.id, userName: USERS.maria_i.name, type: 'fire', timestamp: daysAgo(9) },
        { id: 'r4', userId: USERS.ana.id, userName: USERS.ana.name, type: 'trophy', timestamp: daysAgo(9) },
      ],
      comments: [
        { id: 'c1', userId: USERS.laura.id, userName: USERS.laura.name, content: '¡Felicidades Juan! 🎉 Yo voy a la mitad, ¡pronto te alcanzo!', timestamp: daysAgo(10) },
        { id: 'c2', userId: USERS.maria_i.id, userName: USERS.maria_i.name, content: 'Excelente trabajo Juan, ¡sigue así!', timestamp: daysAgo(9) },
      ],
      createdAt: isoAgo(10), updatedAt: isoAgo(9),
    },
    // Juan level up
    {
      id: 'feed-002', tenantId: T,
      userId: USERS.juan.id, userName: USERS.juan.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
      type: 'level-up', timestamp: daysAgo(10),
      data: { level: 2 },
      reactions: [
        { id: 'r5', userId: USERS.laura.id, userName: USERS.laura.name, type: 'star', timestamp: daysAgo(10) },
      ],
      comments: [],
      createdAt: isoAgo(10), updatedAt: isoAgo(10),
    },
    // Laura completed course
    {
      id: 'feed-003', tenantId: T,
      userId: USERS.laura.id, userName: USERS.laura.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura',
      type: 'course-completed', timestamp: daysAgo(8),
      data: { courseName: COURSES.c1.title },
      reactions: [
        { id: 'r6', userId: USERS.juan.id, userName: USERS.juan.name, type: 'congrats', timestamp: daysAgo(8) },
        { id: 'r7', userId: USERS.pedro.id, userName: USERS.pedro.name, type: 'highfive', timestamp: daysAgo(8) },
        { id: 'r8', userId: USERS.marco.id, userName: USERS.marco.name, type: 'fire', timestamp: daysAgo(7) },
      ],
      comments: [
        { id: 'c3', userId: USERS.juan.id, userName: USERS.juan.name, content: '¡Bienvenida al club de graduados! 😄', timestamp: daysAgo(8) },
      ],
      createdAt: isoAgo(8), updatedAt: isoAgo(7),
    },
    // Laura badge earned
    {
      id: 'feed-004', tenantId: T,
      userId: USERS.laura.id, userName: USERS.laura.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura',
      type: 'badge-earned', timestamp: daysAgo(8),
      data: { badgeName: 'Primer Curso Completado', badgeIcon: '🎓' },
      reactions: [
        { id: 'r9', userId: USERS.ana.id, userName: USERS.ana.name, type: 'trophy', timestamp: daysAgo(8) },
      ],
      comments: [],
      createdAt: isoAgo(8), updatedAt: isoAgo(8),
    },
    // Marco achievement
    {
      id: 'feed-005', tenantId: T,
      userId: USERS.marco.id, userName: USERS.marco.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco',
      type: 'achievement-unlocked', timestamp: daysAgo(7),
      data: { achievementName: 'Quiz Perfectionist', achievementIcon: '🎯' },
      reactions: [
        { id: 'r10', userId: USERS.juan.id, userName: USERS.juan.name, type: 'fire', timestamp: daysAgo(7) },
        { id: 'r11', userId: USERS.laura.id, userName: USERS.laura.name, type: 'star', timestamp: daysAgo(6) },
      ],
      comments: [
        { id: 'c4', userId: USERS.pedro.id, userName: USERS.pedro.name, content: '¡95% en el primer intento! Impresionante 💪', timestamp: daysAgo(7) },
      ],
      createdAt: isoAgo(7), updatedAt: isoAgo(6),
    },
    // Pedro first lesson
    {
      id: 'feed-006', tenantId: T,
      userId: USERS.pedro.id, userName: USERS.pedro.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
      type: 'badge-earned', timestamp: daysAgo(14),
      data: { badgeName: 'Primer Paso', badgeIcon: '🚀' },
      reactions: [
        { id: 'r12', userId: USERS.juan.id, userName: USERS.juan.name, type: 'congrats', timestamp: daysAgo(14) },
      ],
      comments: [],
      createdAt: isoAgo(14), updatedAt: isoAgo(14),
    },
    // Juan mentorship achievement
    {
      id: 'feed-007', tenantId: T,
      userId: USERS.juan.id, userName: USERS.juan.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
      type: 'achievement-unlocked', timestamp: daysAgo(15),
      data: { achievementName: 'Primera Mentoría', achievementIcon: '🤝' },
      reactions: [
        { id: 'r13', userId: USERS.mentor_c.id, userName: USERS.mentor_c.name, type: 'highfive', timestamp: daysAgo(15) },
      ],
      comments: [
        { id: 'c5', userId: USERS.mentor_c.id, userName: USERS.mentor_c.name, content: '¡Fue un placer la sesión, Juan! Mucho potencial.', timestamp: daysAgo(15) },
      ],
      createdAt: isoAgo(15), updatedAt: isoAgo(15),
    },
    // Juan level 3
    {
      id: 'feed-008', tenantId: T,
      userId: USERS.juan.id, userName: USERS.juan.name, userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
      type: 'level-up', timestamp: daysAgo(3),
      data: { level: 3 },
      reactions: [
        { id: 'r14', userId: USERS.laura.id, userName: USERS.laura.name, type: 'trophy', timestamp: daysAgo(3) },
        { id: 'r15', userId: USERS.marco.id, userName: USERS.marco.name, type: 'fire', timestamp: daysAgo(2) },
      ],
      comments: [],
      createdAt: isoAgo(3), updatedAt: isoAgo(2),
    },
  ];

  await upsertMany('activity-feed', feed);
}

// ═══════════════════════════════════════════════
// 15. NOTIFICATIONS
// ═══════════════════════════════════════════════
async function seedNotifications() {
  console.log('\n🔔 15. Notifications...');

  const notifications = [
    // Juan
    { id: 'notif-001', tenantId: T, userId: USERS.juan.id, type: 'achievement', title: '🏆 Logro desbloqueado', message: '¡Has desbloqueado el logro "Primer Curso Completado"!', timestamp: daysAgo(10), read: true, actionUrl: '/achievements', createdAt: isoAgo(10), updatedAt: isoAgo(10) },
    { id: 'notif-002', tenantId: T, userId: USERS.juan.id, type: 'forum-reply', title: '💬 Nueva respuesta en el foro', message: 'María Rodríguez respondió a tu pregunta "¿Cómo puedo ver mi progreso en el dashboard?"', timestamp: daysAgo(17), read: true, actionUrl: '/forums/forum-q-001', relatedId: 'forum-q-001', createdAt: isoAgo(17), updatedAt: isoAgo(17) },
    { id: 'notif-003', tenantId: T, userId: USERS.juan.id, type: 'activity', title: '📅 Sesión de mentoría programada', message: 'Tu sesión con Carlos Hernández está programada para el próximo jueves. Tema: Preparación para entrevista de TL.', timestamp: daysAgo(2), read: false, actionUrl: '/mentorship', createdAt: isoAgo(2), updatedAt: isoAgo(2) },
    { id: 'notif-004', tenantId: T, userId: USERS.juan.id, type: 'course-reminder', title: '📚 Continúa tu curso', message: 'Llevas 60% del curso "Gestión de Cursos en AccessLearn". ¡No te detengas!', timestamp: daysAgo(1), read: false, actionUrl: `/courses/${COURSES.c2.id}`, createdAt: isoAgo(1), updatedAt: isoAgo(1) },

    // Laura
    { id: 'notif-005', tenantId: T, userId: USERS.laura.id, type: 'achievement', title: '🏆 Logro desbloqueado', message: '¡Has desbloqueado el logro "Primer Curso Completado"!', timestamp: daysAgo(8), read: true, actionUrl: '/achievements', createdAt: isoAgo(8), updatedAt: isoAgo(8) },
    { id: 'notif-006', tenantId: T, userId: USERS.laura.id, type: 'activity', title: '🤝 Mentoría aceptada', message: 'Patricia Luna ha aceptado tu solicitud de mentoría sobre "Diseño accesible".', timestamp: daysAgo(14), read: true, actionUrl: '/mentorship', createdAt: isoAgo(14), updatedAt: isoAgo(14) },
    { id: 'notif-007', tenantId: T, userId: USERS.laura.id, type: 'activity', title: '📅 Próxima sesión de mentoría', message: 'Tu sesión con Patricia Luna está programada para la próxima semana. Tema: Auditoría WCAG.', timestamp: daysAgo(1), read: false, actionUrl: '/mentorship', createdAt: isoAgo(1), updatedAt: isoAgo(1) },
    { id: 'notif-008', tenantId: T, userId: USERS.laura.id, type: 'course-reminder', title: '📚 Continúa tu curso', message: 'Llevas 40% del curso "Gestión de Cursos en AccessLearn". ¡Sigue adelante!', timestamp: daysAgo(1), read: false, actionUrl: `/courses/${COURSES.c2.id}`, createdAt: isoAgo(1), updatedAt: isoAgo(1) },

    // Pedro
    { id: 'notif-009', tenantId: T, userId: USERS.pedro.id, type: 'activity', title: '🤝 Mentoría aceptada', message: 'Ricardo Navarro ha aceptado tu solicitud de mentoría sobre "Azure Fundamentals".', timestamp: daysAgo(11), read: true, actionUrl: '/mentorship', createdAt: isoAgo(11), updatedAt: isoAgo(11) },
    { id: 'notif-010', tenantId: T, userId: USERS.pedro.id, type: 'course-reminder', title: '📚 No olvides tu curso', message: 'Llevas 50% del curso "Introducción a AccessLearn". ¡Tu próximo paso te espera!', timestamp: daysAgo(1), read: false, actionUrl: `/courses/${COURSES.c1.id}`, createdAt: isoAgo(1), updatedAt: isoAgo(1) },

    // Marco
    { id: 'notif-011', tenantId: T, userId: USERS.marco.id, type: 'achievement', title: '🎯 Logro desbloqueado', message: '¡Has desbloqueado el logro "Quiz Perfectionist" por obtener 95% en tu primer intento!', timestamp: daysAgo(7), read: true, actionUrl: '/achievements', createdAt: isoAgo(7), updatedAt: isoAgo(7) },
    { id: 'notif-012', tenantId: T, userId: USERS.marco.id, type: 'activity', title: '⏳ Solicitud de mentoría pendiente', message: 'Tu solicitud de mentoría con Carlos Hernández está pendiente de respuesta.', timestamp: daysAgo(2), read: false, actionUrl: '/mentorship', createdAt: isoAgo(2), updatedAt: isoAgo(2) },

    // Ana (Admin)
    { id: 'notif-013', tenantId: T, userId: USERS.ana.id, type: 'activity', title: '👥 Nuevos usuarios registrados', message: '5 nuevos usuarios se han registrado en la plataforma esta semana.', timestamp: daysAgo(1), read: false, actionUrl: '/admin/users', createdAt: isoAgo(1), updatedAt: isoAgo(1) },
    { id: 'notif-014', tenantId: T, userId: USERS.ana.id, type: 'forum-reply', title: '💬 Respuesta a tu pregunta', message: 'Carlos García respondió a tu pregunta sobre exportar reportes de analytics.', timestamp: daysAgo(6), read: true, actionUrl: '/forums/forum-q-004', relatedId: 'forum-q-004', createdAt: isoAgo(6), updatedAt: isoAgo(6) },

    // Carlos mentor
    { id: 'notif-015', tenantId: T, userId: USERS.mentor_c.id, type: 'activity', title: '🤝 Nueva solicitud de mentoría', message: 'Marco Domínguez ha solicitado una mentoría contigo sobre "Revisión de portafolio y carrera en tech".', timestamp: daysAgo(2), read: false, actionUrl: '/mentorship', createdAt: isoAgo(2), updatedAt: isoAgo(2) },
  ];

  await upsertMany('notifications', notifications);
}

// ═══════════════════════════════════════════════
// 16. AUDIT LOGS (recent activity)
// ═══════════════════════════════════════════════
async function seedAuditLogs() {
  console.log('\n📋 16. Audit logs...');

  const logs = [
    { action: 'user.login', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'user', id: USERS.ana.id }, severity: 'info', dAgo: 0 },
    { action: 'user.login', actor: { id: USERS.juan.id, email: USERS.juan.email, role: 'student' }, resource: { type: 'user', id: USERS.juan.id }, severity: 'info', dAgo: 0 },
    { action: 'course.published', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'course', id: COURSES.c1.id, name: COURSES.c1.title }, severity: 'info', dAgo: 20 },
    { action: 'course.published', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'course', id: COURSES.c2.id, name: COURSES.c2.title }, severity: 'info', dAgo: 20 },
    { action: 'course.published', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'course', id: COURSES.c3.id, name: COURSES.c3.title }, severity: 'info', dAgo: 20 },
    { action: 'user.created', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'user', id: USERS.juan.id, name: USERS.juan.name }, severity: 'info', dAgo: 25 },
    { action: 'user.created', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'user', id: USERS.pedro.id, name: USERS.pedro.name }, severity: 'info', dAgo: 25 },
    { action: 'user.created', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'user', id: USERS.laura.id, name: USERS.laura.name }, severity: 'info', dAgo: 25 },
    { action: 'course.completed', actor: { id: USERS.juan.id, email: USERS.juan.email, role: 'student' }, resource: { type: 'course', id: COURSES.c1.id, name: COURSES.c1.title }, severity: 'info', dAgo: 10 },
    { action: 'certificate.issued', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'certificate', id: 'cert-001', name: `Certificado — ${USERS.juan.name}` }, severity: 'info', dAgo: 10 },
    { action: 'course.completed', actor: { id: USERS.laura.id, email: USERS.laura.email, role: 'student' }, resource: { type: 'course', id: COURSES.c1.id, name: COURSES.c1.title }, severity: 'info', dAgo: 8 },
    { action: 'certificate.issued', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'certificate', id: 'cert-002', name: `Certificado — ${USERS.laura.name}` }, severity: 'info', dAgo: 8 },
    { action: 'mentorship.requested', actor: { id: USERS.juan.id, email: USERS.juan.email, role: 'student' }, resource: { type: 'mentorship', id: 'mentorship-req-001' }, severity: 'info', dAgo: 20 },
    { action: 'mentorship.accepted', actor: { id: USERS.mentor_c.id, email: USERS.mentor_c.email, role: 'mentor' }, resource: { type: 'mentorship', id: 'mentorship-req-001' }, severity: 'info', dAgo: 19 },
    { action: 'user.login', actor: { id: USERS.laura.id, email: USERS.laura.email, role: 'student' }, resource: { type: 'user', id: USERS.laura.id }, severity: 'info', dAgo: 1 },
    { action: 'user.login', actor: { id: USERS.pedro.id, email: USERS.pedro.email, role: 'student' }, resource: { type: 'user', id: USERS.pedro.id }, severity: 'info', dAgo: 1 },
    { action: 'user.login', actor: { id: USERS.marco.id, email: USERS.marco.email, role: 'student' }, resource: { type: 'user', id: USERS.marco.id }, severity: 'info', dAgo: 1 },
    { action: 'settings.updated', actor: { id: USERS.ana.id, email: USERS.ana.email, role: 'super-admin' }, resource: { type: 'company-settings', id: `company-settings-${T}` }, severity: 'info', dAgo: 40 },
  ].map((l, i) => ({
    id: `audit-${String(i + 1).padStart(3, '0')}`,
    tenantId: T,
    timestamp: isoAgo(l.dAgo),
    action: l.action,
    actor: l.actor,
    resource: l.resource,
    changes: {},
    metadata: { ip: '187.200.123.45', userAgent: 'Mozilla/5.0' },
    severity: l.severity,
    status: 'success',
    createdAt: isoAgo(l.dAgo),
    updatedAt: isoAgo(l.dAgo),
  }));

  await upsertMany('audit-logs', logs);
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('🚀 AccessLearn — Seed Demo Complete (Kainet)');
  console.log('═══════════════════════════════════════════════');

  try {
    // Verify DB connection
    const { resource: dbInfo } = await db.read();
    console.log(`✅ Connected to Cosmos DB: ${dbInfo?.id}\n`);

    await seedUsers();
    await seedCompanySettings();
    await seedCategories();
    await seedGroups();
    await seedAssignments();
    await seedProgress();
    await seedMentorshipRequests();
    await seedMentorshipSessions();
    await seedForums();
    await seedQuizAttempts();
    await seedCertificates();
    await seedCertificateTemplate();
    await seedAchievements();
    await seedActivityFeed();
    await seedNotifications();
    await seedAuditLogs();

    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 ¡DEMO COMPLETO! Datos generados:');
    console.log('═══════════════════════════════════════════════');
    console.log(`  👥 ${newUsersData.length} usuarios nuevos (+ ${Object.keys(USERS).length} existentes)`);
    console.log('  🏢 Company settings configurados');
    console.log('  📂 8 categorías de cursos');
    console.log('  👥 4 grupos (departamentos)');  
    console.log('  📋 Course assignments para todos los estudiantes');
    console.log('  📊 User progress (variado: 30%-100%)');
    console.log('  🤝 6 mentorship requests (2 pending, 4 accepted)');
    console.log('  📅 6 mentorship sessions (3 completed, 3 scheduled)');
    console.log('  💬 5 forum questions con 6 answers');
    console.log('  📝 5 quiz attempts con scores variados');
    console.log('  🎓 2 certificates emitidos');
    console.log('  📜 Certificate template personalizado');
    console.log('  🏆 10 achievements desbloqueados');
    console.log('  📱 8 activity feed items con reactions/comments');
    console.log('  🔔 15 notifications para diferentes usuarios');
    console.log('  📋 18 audit log entries');
    console.log('\n📋 Todos los usuarios usan password: Demo123!');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n💥 Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
