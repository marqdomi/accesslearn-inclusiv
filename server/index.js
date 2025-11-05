import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = process.env.SQLITE_DATA_DIR || path.join(__dirname, '..', 'data')
const DB_FILE = process.env.SQLITE_DB_PATH || path.join(DATA_DIR, 'app.db')
const PORT = Number(process.env.API_PORT || process.env.PORT || 4000)

fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(DB_FILE)
db.pragma('journal_mode = WAL')

db.prepare(`
  CREATE TABLE IF NOT EXISTS data_store (
    table_name TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (table_name, id)
  )
`).run()

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

const toRow = (tableName, payload) => ({
  table_name: tableName,
  id: payload.id,
  data: JSON.stringify(payload),
  created_at: Date.now(),
  updated_at: Date.now()
})

const getAllStmt = db.prepare('SELECT data FROM data_store WHERE table_name = ?')
const getOneStmt = db.prepare('SELECT data FROM data_store WHERE table_name = ? AND id = ?')
const insertStmt = db.prepare(`
  INSERT INTO data_store (table_name, id, data, created_at, updated_at)
  VALUES (@table_name, @id, @data, @created_at, @updated_at)
`)
const updateStmt = db.prepare(`
  UPDATE data_store
  SET data = @data, updated_at = @updated_at
  WHERE table_name = @table_name AND id = @id
`)
const deleteStmt = db.prepare('DELETE FROM data_store WHERE table_name = ? AND id = ?')

const SENSITIVE_TABLES = new Set(['auth-users'])

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

// ============================================================================
// SQL Employee Credentials Functions
// ============================================================================

// Crear tabla employee_credentials si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS employee_credentials (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    role TEXT NOT NULL DEFAULT 'employee',
    status TEXT DEFAULT 'active',
    hire_date TEXT,
    phone TEXT,
    emergency_contact TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`).run()

const getEmployeesStmt = db.prepare('SELECT * FROM employee_credentials ORDER BY created_at DESC')
const getEmployeeStmt = db.prepare('SELECT * FROM employee_credentials WHERE id = ?')
const getEmployeeByEmailStmt = db.prepare('SELECT * FROM employee_credentials WHERE email = ?')
const insertEmployeeStmt = db.prepare(`
  INSERT INTO employee_credentials (id, full_name, email, department, role, status, hire_date, phone, emergency_contact, created_at, updated_at)
  VALUES (@id, @full_name, @email, @department, @role, @status, @hire_date, @phone, @emergency_contact, @created_at, @updated_at)
`)
const updateEmployeeStmt = db.prepare(`
  UPDATE employee_credentials
  SET full_name = @full_name, email = @email, department = @department, role = @role, 
      status = @status, hire_date = @hire_date, phone = @phone, emergency_contact = @emergency_contact, updated_at = @updated_at
  WHERE id = @id
`)
const deleteEmployeeStmt = db.prepare('DELETE FROM employee_credentials WHERE id = ?')

function getAllEmployees() {
  return getEmployeesStmt.all()
}

function getEmployeeById(id) {
  return getEmployeeStmt.get(id)
}

function getEmployeeByEmail(email) {
  return getEmployeeByEmailStmt.get(normalizeEmail(email))
}

function createEmployee(data) {
  const timestamp = Date.now()
  insertEmployeeStmt.run({
    id: data.id,
    full_name: `${data.firstName} ${data.lastName}`,
    email: normalizeEmail(data.email),
    department: data.department || null,
    role: data.role || 'employee',
    status: data.status || 'pending',
    hire_date: data.hireDate || null,
    phone: data.phone || null,
    emergency_contact: data.emergencyContact || null,
    created_at: data.createdAt || timestamp,
    updated_at: timestamp
  })
}

function updateEmployee(id, data) {
  const existing = getEmployeeById(id)
  if (!existing) return false
  
  updateEmployeeStmt.run({
    id,
    full_name: data.fullName || existing.full_name,
    email: data.email ? normalizeEmail(data.email) : existing.email,
    department: data.department !== undefined ? data.department : existing.department,
    role: data.role || existing.role,
    status: data.status || existing.status,
    hire_date: data.hireDate !== undefined ? data.hireDate : existing.hire_date,
    phone: data.phone !== undefined ? data.phone : existing.phone,
    emergency_contact: data.emergencyContact !== undefined ? data.emergencyContact : existing.emergency_contact,
    updated_at: Date.now()
  })
  return true
}

function deleteEmployee(id) {
  const result = deleteEmployeeStmt.run(id)
  return result.changes > 0
}

function getRecords(tableName) {
  return getAllStmt
    .all(tableName)
    .map(parseRow)
    .filter(Boolean)
}

function getRecord(tableName, id) {
  return parseRow(getOneStmt.get(tableName, id))
}

function insertRecord(tableName, payload) {
  insertStmt.run(toRow(tableName, payload))
}

function updateRecord(tableName, payload) {
  updateStmt.run({
    table_name: tableName,
    id: payload.id,
    data: JSON.stringify(payload),
    updated_at: Date.now()
  })
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, 64)
  return {
    salt,
    hash: derived.toString('hex')
  }
}

function verifyPassword(password, salt, hash) {
  try {
    const derived = crypto.scryptSync(password, salt, 64)
    const hashBuffer = Buffer.from(hash, 'hex')
    if (hashBuffer.length !== derived.length) {
      return false
    }
    return crypto.timingSafeEqual(hashBuffer, derived)
  } catch (error) {
    console.error('Password verification failed:', error)
    return false
  }
}

function validatePasswordStrength(password) {
  const errors = []
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  return errors
}

function parseRow(row) {
  if (!row) {
    return null
  }

  try {
    return JSON.parse(row.data)
  } catch (error) {
    console.error('Failed to parse stored JSON record:', error)
    return null
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/admin/setup-status', (req, res) => {
  const admins = getRecords('auth-users').filter(user => user.role === 'admin')
  res.json({ needsSetup: admins.length === 0 })
})

app.post('/api/admin/initialize', (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body || {}

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const normalizedEmail = normalizeEmail(email)

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }

  const passwordIssues = validatePasswordStrength(password)
  if (passwordIssues.length > 0) {
    return res.status(400).json({ error: passwordIssues.join(', ') })
  }

  const existingAdmins = getRecords('auth-users').filter(user => user.role === 'admin')
  if (existingAdmins.length > 0) {
    return res.status(409).json({ error: 'Admin user already exists' })
  }

  const allUsers = getRecords('auth-users')
  if (allUsers.some(user => user.email === normalizedEmail)) {
    return res.status(409).json({ error: 'Email is already in use' })
  }

  const id = crypto.randomUUID()
  const timestamp = Date.now()
  const { salt, hash } = hashPassword(password)

  const profile = {
    id,
    email: normalizedEmail,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    displayName: `${firstName} ${lastName}`,
    role: 'admin',
    createdAt: timestamp,
    lastLoginAt: null,
    preferences: {
      highContrast: false,
      textSize: 'normal',
      reduceMotion: false,
      disableSoundEffects: false,
      avatar: undefined,
      displayName: `${firstName} ${lastName}`
    }
  }

  const authRecord = {
    id,
    email: normalizedEmail,
    role: 'admin',
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: timestamp,
    updatedAt: timestamp,
    passwordChangedAt: timestamp
  }

  try {
    insertRecord('user-profiles', profile)
    insertRecord('auth-users', authRecord)
    res.status(201).json({
      data: {
        id,
        email: normalizedEmail,
        role: 'admin',
        firstName,
        lastName
      }
    })
  } catch (error) {
    console.error('Admin initialization failed:', error)
    res.status(500).json({ error: 'Failed to initialize admin user' })
  }
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const normalizedEmail = normalizeEmail(email)
  const authUsers = getRecords('auth-users')
  const authUser = authUsers.find(user => user.email === normalizedEmail)

  if (!authUser) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  if (!verifyPassword(password, authUser.passwordSalt, authUser.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const profile = getRecord('user-profiles', authUser.id)
  if (profile) {
    updateRecord('user-profiles', {
      ...profile,
      lastLoginAt: Date.now()
    })
  }

  res.json({
    data: {
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null
    }
  })
})

// Endpoint para inscripción masiva de empleados
app.post('/api/employees/bulk', (req, res) => {
  const { employees } = req.body

  if (!Array.isArray(employees) || employees.length === 0) {
    return res.status(400).json({ error: 'employees array is required' })
  }

  const successful = []
  const failed = []

  const transaction = db.transaction(() => {
    employees.forEach((employee, index) => {
      try {
        const { email, firstName, lastName, department, temporaryPassword, id } = employee

        if (!email || !firstName || !lastName || !temporaryPassword || !id) {
          failed.push({
            row: index + 1,
            email: email || 'unknown',
            errors: ['Missing required fields']
          })
          return
        }

        const normalizedEmail = normalizeEmail(email)
        
        // Verificar si el usuario ya existe en tabla SQL
        const existingEmployee = getEmployeeByEmail(normalizedEmail)
        if (existingEmployee) {
          failed.push({
            row: index + 1,
            email,
            errors: ['Email already exists']
          })
          return
        }

        // Crear usuario de autenticación
        const timestamp = Date.now()
        const { salt, hash } = hashPassword(temporaryPassword)

        const authRecord = {
          id,
          email: normalizedEmail,
          role: 'employee',
          passwordSalt: salt,
          passwordHash: hash,
          createdAt: timestamp,
          updatedAt: timestamp,
          passwordChangedAt: timestamp,
          requiresPasswordChange: true
        }

        // Crear perfil de usuario
        const profile = {
          id,
          email: normalizedEmail,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          displayName: `${firstName} ${lastName}`,
          department: department || 'General',
          role: 'employee',
          createdAt: timestamp,
          lastLoginAt: null,
          preferences: {
            highContrast: false,
            textSize: 'normal',
            reduceMotion: false,
            disableSoundEffects: false,
            avatar: undefined,
            displayName: `${firstName} ${lastName}`
          }
        }

        // Guardar en tabla SQL usando la función createEmployee
        createEmployee({
          id,
          firstName,
          lastName,
          email: normalizedEmail,
          department: department || null,
          role: 'employee',
          status: 'pending',
          hireDate: employee.hireDate || null,
          phone: employee.phone || null,
          emergencyContact: employee.emergencyContact || null,
          createdAt: timestamp
        })

        // Guardar auth y perfil en data_store (para login)
        insertRecord('auth-users', authRecord)
        insertRecord('user-profiles', profile)

        // Retornar en formato camelCase
        successful.push({
          id,
          fullName: `${firstName} ${lastName}`,
          email: normalizedEmail,
          department: department || null,
          role: 'employee',
          status: 'pending',
          createdAt: timestamp,
          temporaryPassword
        })
      } catch (error) {
        console.error(`Error processing employee at index ${index}:`, error)
        failed.push({
          row: index + 1,
          email: employee.email || 'unknown',
          errors: [error.message || 'Unknown error']
        })
      }
    })
  })

  try {
    transaction()
    res.status(201).json({
      data: {
        successful,
        failed,
        totalProcessed: employees.length
      }
    })
  } catch (error) {
    console.error('Bulk employee creation failed:', error)
    res.status(500).json({ error: 'Failed to create employees' })
  }
})

// Endpoint para obtener estadísticas del dashboard
app.get('/api/admin/stats', (req, res) => {
  try {
    const employees = getAllEmployees()  // Ahora usa tabla SQL
    const users = getRecords('user-profiles')
    const courses = getRecords('courses')
    const allProgress = getRecords('user-progress')

    // Calcular tasa de finalización
    let totalLessons = 0
    let completedLessons = 0

    courses.forEach(course => {
      if (course.modules) {
        course.modules.forEach(module => {
          if (module.lessons) {
            totalLessons += module.lessons.length
          }
        })
      }
    })

    allProgress.forEach(progress => {
      if (progress.completedAt) {
        completedLessons++
      }
    })

    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Calcular XP total otorgado
    const userStats = getRecords('user-stats')
    const totalXP = userStats.reduce((sum, stats) => sum + (stats.totalXP || 0), 0)

    res.json({
      data: {
        totalEmployees: employees.length,
        pendingActivation: employees.filter(e => e.status === 'pending').length,
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.status === 'published').length,
        completionRate,
        totalXP,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.lastLoginAt && (Date.now() - u.lastLoginAt < 30 * 24 * 60 * 60 * 1000)).length
      }
    })
  } catch (error) {
    console.error('Failed to get admin stats:', error)
    res.status(500).json({ error: 'Failed to retrieve statistics' })
  }
})

// Endpoint para obtener todos los usuarios con información completa
app.get('/api/users/all', (req, res) => {
  try {
    const profiles = getRecords('user-profiles')
    const authUsers = getRecords('auth-users')
    const credentials = getAllEmployees()  // Ahora usa tabla SQL
    
    // Combinar datos de múltiples tablas
    const users = profiles.map(profile => {
      const auth = authUsers.find(a => a.id === profile.id)
      const cred = credentials.find(c => c.id === profile.id)
      
      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        fullName: profile.fullName,
        department: profile.department,
        role: profile.role,
        status: cred?.status || (auth?.requiresPasswordChange ? 'pending' : 'active'),
        createdAt: profile.createdAt,
        lastLoginAt: profile.lastLoginAt,
        temporaryPassword: cred?.temporaryPassword,
        requiresPasswordChange: auth?.requiresPasswordChange || false
      }
    })
    
    res.json({ data: users })
  } catch (error) {
    console.error('Failed to get all users:', error)
    res.status(500).json({ error: 'Failed to retrieve users' })
  }
})

// Endpoint para actualizar un usuario
app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    // Actualizar perfil
    const profile = getRecord('user-profiles', id)
    if (!profile) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const updatedProfile = {
      ...profile,
      ...updates,
      fullName: `${updates.firstName || profile.firstName} ${updates.lastName || profile.lastName}`,
      displayName: updates.displayName || `${updates.firstName || profile.firstName} ${updates.lastName || profile.lastName}`
    }
    
    updateRecord('user-profiles', updatedProfile)
    
    // Actualizar auth si cambió el rol
    if (updates.role) {
      const authUser = getRecord('auth-users', id)
      if (authUser) {
        updateRecord('auth-users', {
          ...authUser,
          role: updates.role
        })
      }
    }
    
    res.json({ data: updatedProfile })
  } catch (error) {
    console.error('Failed to update user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Endpoint para eliminar un usuario
app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    
    // Eliminar de todas las tablas relacionadas
    deleteStmt.run('user-profiles', id)
    deleteStmt.run('auth-users', id)
    deleteStmt.run('employee-credentials', id)
    
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Endpoint para reenviar invitación (regenerar contraseña temporal)
app.post('/api/users/:id/resend-invitation', (req, res) => {
  try {
    const { id } = req.params
    
    const credential = getRecord('employee-credentials', id)
    if (!credential) {
      return res.status(404).json({ error: 'Employee credential not found' })
    }
    
    // Generar nueva contraseña temporal
    const newPassword = generateTemporaryPassword()
    const { salt, hash } = hashPassword(newPassword)
    
    // Actualizar credenciales
    const updatedCredential = {
      ...credential,
      temporaryPassword: newPassword,
      status: 'pending',
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    }
    
    updateRecord('employee-credentials', updatedCredential)
    
    // Actualizar auth
    const authUser = getRecord('auth-users', id)
    if (authUser) {
      updateRecord('auth-users', {
        ...authUser,
        passwordSalt: salt,
        passwordHash: hash,
        requiresPasswordChange: true
      })
    }
    
    res.json({ 
      data: {
        ...updatedCredential,
        message: 'Invitation resent successfully'
      }
    })
  } catch (error) {
    console.error('Failed to resend invitation:', error)
    res.status(500).json({ error: 'Failed to resend invitation' })
  }
})

function generateTemporaryPassword() {
  const adjectives = ['Strong', 'Swift', 'Bright', 'Bold', 'Brave', 'Clear', 'Smart', 'Quick']
  const nouns = ['Lion', 'Tiger', 'Eagle', 'Phoenix', 'Dragon', 'Falcon', 'Bear', 'Wolf']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  const special = '!@#$%'[Math.floor(Math.random() * 5)]
  return `${adj}${noun}${num}${special}`
}

// ============================================
// COURSE MANAGEMENT ENDPOINTS
// ============================================

// Obtener todos los cursos con información completa
app.get('/api/courses/all', (req, res) => {
  try {
    const courses = getRecords('courses')
    
    // Enriquecer cursos con información adicional
    const enrichedCourses = courses.map(course => {
      const modules = getRecords('course-modules').filter(m => m.courseId === course.id)
      const lessons = getRecords('course-lessons').filter(l => 
        modules.some(m => m.id === l.moduleId)
      )
      
      return {
        ...course,
        moduleCount: modules.length,
        lessonCount: lessons.length,
        totalXP: lessons.reduce((sum, l) => sum + (l.xpReward || 0), 0),
        publishedAt: course.publishedAt || null,
        lastEditedAt: course.updatedAt || course.createdAt
      }
    })
    
    res.json({ data: enrichedCourses })
  } catch (error) {
    console.error('Failed to get all courses:', error)
    res.status(500).json({ error: 'Failed to retrieve courses' })
  }
})

// Obtener un curso específico con toda su estructura
app.get('/api/courses/:id/full', (req, res) => {
  try {
    const course = getRecord('courses', req.params.id)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    const modules = getRecords('course-modules')
      .filter(m => m.courseId === course.id)
      .sort((a, b) => a.order - b.order)
    
    const modulesWithLessons = modules.map(module => {
      const lessons = getRecords('course-lessons')
        .filter(l => l.moduleId === module.id)
        .sort((a, b) => a.order - b.order)
      
      return {
        ...module,
        lessons
      }
    })
    
    res.json({
      data: {
        ...course,
        modules: modulesWithLessons
      }
    })
  } catch (error) {
    console.error('Failed to get course:', error)
    res.status(500).json({ error: 'Failed to retrieve course' })
  }
})

// Crear un nuevo curso
app.post('/api/courses', (req, res) => {
  try {
    const { title, description, category, difficulty, estimatedHours, ...rest } = req.body
    
    if (!title) {
      return res.status(400).json({ error: 'Course title is required' })
    }
    
    const courseId = crypto.randomUUID()
    const timestamp = Date.now()
    
    const newCourse = {
      id: courseId,
      title: title.trim(),
      description: description?.trim() || '',
      category: category || 'General',
      difficulty: difficulty || 'beginner',
      estimatedHours: estimatedHours || 0,
      status: 'draft',
      visibility: 'private',
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: null,
      ...rest
    }
    
    insertRecord('courses', newCourse)
    res.status(201).json({ data: newCourse })
  } catch (error) {
    console.error('Failed to create course:', error)
    res.status(500).json({ error: 'Failed to create course' })
  }
})

// Actualizar un curso
app.put('/api/courses/:id', (req, res) => {
  try {
    const course = getRecord('courses', req.params.id)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    const updates = req.body
    const updatedCourse = {
      ...course,
      ...updates,
      id: req.params.id,
      updatedAt: Date.now()
    }
    
    updateRecord('courses', updatedCourse)
    res.json({ data: updatedCourse })
  } catch (error) {
    console.error('Failed to update course:', error)
    res.status(500).json({ error: 'Failed to update course' })
  }
})

// Publicar un curso
app.post('/api/courses/:id/publish', (req, res) => {
  try {
    const course = getRecord('courses', req.params.id)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    // Validar que el curso tiene contenido
    const modules = getRecords('course-modules').filter(m => m.courseId === course.id)
    if (modules.length === 0) {
      return res.status(400).json({ error: 'Cannot publish course without modules' })
    }
    
    const hasLessons = modules.some(module => {
      const lessons = getRecords('course-lessons').filter(l => l.moduleId === module.id)
      return lessons.length > 0
    })
    
    if (!hasLessons) {
      return res.status(400).json({ error: 'Cannot publish course without lessons' })
    }
    
    const publishedCourse = {
      ...course,
      status: 'published',
      visibility: 'public',
      publishedAt: Date.now(),
      updatedAt: Date.now()
    }
    
    updateRecord('courses', publishedCourse)
    res.json({ data: publishedCourse })
  } catch (error) {
    console.error('Failed to publish course:', error)
    res.status(500).json({ error: 'Failed to publish course' })
  }
})

// Despublicar un curso
app.post('/api/courses/:id/unpublish', (req, res) => {
  try {
    const course = getRecord('courses', req.params.id)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    const unpublishedCourse = {
      ...course,
      status: 'draft',
      visibility: 'private',
      updatedAt: Date.now()
    }
    
    updateRecord('courses', unpublishedCourse)
    res.json({ data: unpublishedCourse })
  } catch (error) {
    console.error('Failed to unpublish course:', error)
    res.status(500).json({ error: 'Failed to unpublish course' })
  }
})

// Archivar un curso
app.post('/api/courses/:id/archive', (req, res) => {
  try {
    const course = getRecord('courses', req.params.id)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    const archivedCourse = {
      ...course,
      status: 'archived',
      visibility: 'private',
      archivedAt: Date.now(),
      updatedAt: Date.now()
    }
    
    updateRecord('courses', archivedCourse)
    res.json({ data: archivedCourse })
  } catch (error) {
    console.error('Failed to archive course:', error)
    res.status(500).json({ error: 'Failed to archive course' })
  }
})

// Duplicar un curso
app.post('/api/courses/:id/duplicate', (req, res) => {
  try {
    const originalCourse = getRecord('courses', req.params.id)
    if (!originalCourse) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    const newCourseId = crypto.randomUUID()
    const timestamp = Date.now()
    
    // Duplicar curso
    const duplicatedCourse = {
      ...originalCourse,
      id: newCourseId,
      title: `${originalCourse.title} (Copy)`,
      status: 'draft',
      visibility: 'private',
      publishedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    
    insertRecord('courses', duplicatedCourse)
    
    // Duplicar módulos y lecciones
    const modules = getRecords('course-modules').filter(m => m.courseId === originalCourse.id)
    
    modules.forEach((module, moduleIndex) => {
      const newModuleId = crypto.randomUUID()
      const duplicatedModule = {
        ...module,
        id: newModuleId,
        courseId: newCourseId,
        createdAt: timestamp,
        updatedAt: timestamp
      }
      
      insertRecord('course-modules', duplicatedModule)
      
      // Duplicar lecciones del módulo
      const lessons = getRecords('course-lessons').filter(l => l.moduleId === module.id)
      lessons.forEach(lesson => {
        const newLessonId = crypto.randomUUID()
        const duplicatedLesson = {
          ...lesson,
          id: newLessonId,
          moduleId: newModuleId,
          createdAt: timestamp,
          updatedAt: timestamp
        }
        
        insertRecord('course-lessons', duplicatedLesson)
      })
    })
    
    res.status(201).json({ data: duplicatedCourse })
  } catch (error) {
    console.error('Failed to duplicate course:', error)
    res.status(500).json({ error: 'Failed to duplicate course' })
  }
})

// Eliminar un curso (solo si está en draft)
app.delete('/api/courses/:id', (req, res) => {
  try {
    const course = getRecord('courses', req.params.id)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    if (course.status === 'published') {
      return res.status(400).json({ 
        error: 'Cannot delete published course. Archive it first.' 
      })
    }
    
    // Eliminar módulos y lecciones asociadas
    const modules = getRecords('course-modules').filter(m => m.courseId === course.id)
    modules.forEach(module => {
      const lessons = getRecords('course-lessons').filter(l => l.moduleId === module.id)
      lessons.forEach(lesson => {
        deleteStmt.run('course-lessons', lesson.id)
      })
      deleteStmt.run('course-modules', module.id)
    })
    
    // Eliminar el curso
    deleteStmt.run('courses', req.params.id)
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete course:', error)
    res.status(500).json({ error: 'Failed to delete course' })
  }
})

// ============================================
// MODULE MANAGEMENT ENDPOINTS
// ============================================

// Crear un módulo
app.post('/api/courses/:courseId/modules', (req, res) => {
  try {
    const course = getRecord('courses', req.params.courseId)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }
    
    const moduleId = crypto.randomUUID()
    const timestamp = Date.now()
    
    const newModule = {
      id: moduleId,
      courseId: req.params.courseId,
      title: req.body.title || 'New Module',
      description: req.body.description || '',
      order: req.body.order ?? 0,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    
    insertRecord('course-modules', newModule)
    res.status(201).json({ data: newModule })
  } catch (error) {
    console.error('Failed to create module:', error)
    res.status(500).json({ error: 'Failed to create module' })
  }
})

// Actualizar un módulo
app.put('/api/modules/:id', (req, res) => {
  try {
    const module = getRecord('course-modules', req.params.id)
    if (!module) {
      return res.status(404).json({ error: 'Module not found' })
    }
    
    const updatedModule = {
      ...module,
      ...req.body,
      id: req.params.id,
      courseId: module.courseId,
      updatedAt: Date.now()
    }
    
    updateRecord('course-modules', updatedModule)
    res.json({ data: updatedModule })
  } catch (error) {
    console.error('Failed to update module:', error)
    res.status(500).json({ error: 'Failed to update module' })
  }
})

// Eliminar un módulo
app.delete('/api/modules/:id', (req, res) => {
  try {
    const module = getRecord('course-modules', req.params.id)
    if (!module) {
      return res.status(404).json({ error: 'Module not found' })
    }
    
    // Eliminar lecciones asociadas
    const lessons = getRecords('course-lessons').filter(l => l.moduleId === module.id)
    lessons.forEach(lesson => {
      deleteStmt.run('course-lessons', lesson.id)
    })
    
    // Eliminar el módulo
    deleteStmt.run('course-modules', req.params.id)
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete module:', error)
    res.status(500).json({ error: 'Failed to delete module' })
  }
})

// ============================================
// LESSON MANAGEMENT ENDPOINTS
// ============================================

// Crear una lección
app.post('/api/modules/:moduleId/lessons', (req, res) => {
  try {
    const module = getRecord('course-modules', req.params.moduleId)
    if (!module) {
      return res.status(404).json({ error: 'Module not found' })
    }
    
    const lessonId = crypto.randomUUID()
    const timestamp = Date.now()
    
    const newLesson = {
      id: lessonId,
      moduleId: req.params.moduleId,
      title: req.body.title || 'New Lesson',
      description: req.body.description || '',
      type: req.body.type || 'content',
      content: req.body.content || '',
      duration: req.body.duration || 0,
      order: req.body.order ?? 0,
      xpReward: req.body.xpReward || 0,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    
    insertRecord('course-lessons', newLesson)
    res.status(201).json({ data: newLesson })
  } catch (error) {
    console.error('Failed to create lesson:', error)
    res.status(500).json({ error: 'Failed to create lesson' })
  }
})

// Actualizar una lección
app.put('/api/lessons/:id', (req, res) => {
  try {
    const lesson = getRecord('course-lessons', req.params.id)
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    
    const updatedLesson = {
      ...lesson,
      ...req.body,
      id: req.params.id,
      moduleId: lesson.moduleId,
      updatedAt: Date.now()
    }
    
    updateRecord('course-lessons', updatedLesson)
    res.json({ data: updatedLesson })
  } catch (error) {
    console.error('Failed to update lesson:', error)
    res.status(500).json({ error: 'Failed to update lesson' })
  }
})

// Eliminar una lección
app.delete('/api/lessons/:id', (req, res) => {
  try {
    const lesson = getRecord('course-lessons', req.params.id)
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    
    deleteStmt.run('course-lessons', req.params.id)
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete lesson:', error)
    res.status(500).json({ error: 'Failed to delete lesson' })
  }
})

app.get('/api/:table', (req, res) => {
  if (SENSITIVE_TABLES.has(req.params.table)) {
    return res.status(403).json({ error: 'Access to this resource is restricted' })
  }
  const rows = getAllStmt.all(req.params.table)
  const data = rows
    .map(parseRow)
    .filter(Boolean)
  res.json({ data })
})

app.get('/api/:table/:id', (req, res) => {
  if (SENSITIVE_TABLES.has(req.params.table)) {
    return res.status(403).json({ error: 'Access to this resource is restricted' })
  }
  const row = getOneStmt.get(req.params.table, req.params.id)
  const data = parseRow(row)

  if (!data) {
    return res.status(404).json({ error: 'Record not found' })
  }

  res.json({ data })
})

app.post('/api/:table', (req, res) => {
  if (SENSITIVE_TABLES.has(req.params.table)) {
    return res.status(403).json({ error: 'Access to this resource is restricted' })
  }
  const payload = req.body

  if (!payload?.id) {
    return res.status(400).json({ error: 'Payload requires an id field' })
  }

  const existing = getOneStmt.get(req.params.table, payload.id)
  if (existing) {
    return res.status(409).json({ error: `Record ${payload.id} already exists in ${req.params.table}` })
  }

  insertStmt.run(toRow(req.params.table, payload))
  res.status(201).json({ data: payload })
})

app.put('/api/:table/:id', (req, res) => {
  if (SENSITIVE_TABLES.has(req.params.table)) {
    return res.status(403).json({ error: 'Access to this resource is restricted' })
  }
  const payload = req.body

  if (!payload?.id) {
    return res.status(400).json({ error: 'Payload requires an id field' })
  }

  const result = updateStmt.run({
    table_name: req.params.table,
    id: req.params.id,
    data: JSON.stringify(payload),
    updated_at: Date.now()
  })

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Record not found' })
  }

  res.json({ data: payload })
})

app.delete('/api/:table/:id', (req, res) => {
  if (SENSITIVE_TABLES.has(req.params.table)) {
    return res.status(403).json({ error: 'Access to this resource is restricted' })
  }
  const result = deleteStmt.run(req.params.table, req.params.id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Record not found' })
  }
  res.status(204).send()
})

// ============================================================================
// Employee Credentials CRUD Endpoints
// ============================================================================

/**
 * GET /api/employee-credentials
 * Obtener todas las credenciales de empleados
 */
app.get('/api/employee-credentials', (req, res) => {
  try {
    const employees = getAllEmployees()
    
    // Convertir de snake_case (SQL) a camelCase (JSON)
    const credentials = employees.map(emp => ({
      id: emp.id,
      fullName: emp.full_name,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      status: emp.status,
      hireDate: emp.hire_date,
      phone: emp.phone,
      emergencyContact: emp.emergency_contact,
      createdAt: emp.created_at,
      updatedAt: emp.updated_at
    }))
    
    res.json({ data: credentials })
  } catch (error) {
    console.error('Error fetching employee credentials:', error)
    res.status(500).json({ error: 'Failed to fetch employee credentials' })
  }
})

/**
 * GET /api/employee-credentials/:id
 * Obtener una credencial específica por ID
 */
app.get('/api/employee-credentials/:id', (req, res) => {
  try {
    const employee = getEmployeeById(req.params.id)
    if (!employee) {
      return res.status(404).json({ error: 'Employee credential not found' })
    }
    
    // Convertir de snake_case a camelCase
    const credential = {
      id: employee.id,
      fullName: employee.full_name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      status: employee.status,
      hireDate: employee.hire_date,
      phone: employee.phone,
      emergencyContact: employee.emergency_contact,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at
    }
    
    res.json({ data: credential })
  } catch (error) {
    console.error('Error fetching employee credential:', error)
    res.status(500).json({ error: 'Failed to fetch employee credential' })
  }
})

/**
 * POST /api/employee-credentials
 * Crear una nueva credencial de empleado
 */
app.post('/api/employee-credentials', (req, res) => {
  try {
    const employee = req.body

    // Validar campos requeridos
    if (!employee.id || !employee.email || !employee.firstName || 
        !employee.lastName || !employee.temporaryPassword) {
      return res.status(400).json({ 
        error: 'Missing required fields: id, email, firstName, lastName, temporaryPassword' 
      })
    }

    const normalizedEmail = normalizeEmail(employee.email)

    // Verificar si el email ya existe en employee_credentials
    const existingEmployee = getEmployeeByEmail(normalizedEmail)
    if (existingEmployee) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    const timestamp = Date.now()
    const { salt, hash } = hashPassword(employee.temporaryPassword)

    // Crear registro de autenticación (aún en data_store)
    const authRecord = {
      id: employee.id,
      email: normalizedEmail,
      role: employee.role || 'employee',
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: timestamp,
      updatedAt: timestamp,
      passwordChangedAt: timestamp,
      requiresPasswordChange: true
    }

    // Crear perfil de usuario (aún en data_store)
    const profile = {
      id: employee.id,
      email: normalizedEmail,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      displayName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department || 'General',
      role: employee.role || 'employee',
      createdAt: timestamp,
      lastLoginAt: null,
      preferences: {
        highContrast: false,
        textSize: 'normal',
        reduceMotion: false,
        disableSoundEffects: false,
        avatar: undefined,
        displayName: `${employee.firstName} ${employee.lastName}`
      }
    }

    // Guardar en la base de datos SQL y data_store
    const transaction = db.transaction(() => {
      // Guardar en tabla SQL
      createEmployee({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: normalizedEmail,
        department: employee.department,
        role: employee.role || 'employee',
        status: employee.status || 'pending',
        hireDate: employee.hireDate,
        phone: employee.phone,
        emergencyContact: employee.emergencyContact,
        createdAt: timestamp
      })
      
      // Guardar en data_store (auth y perfil)
      insertRecord('auth-users', authRecord)
      insertRecord('user-profiles', profile)
    })

    transaction()

    // Retornar en formato camelCase
    res.status(201).json({ 
      data: {
        id: employee.id,
        fullName: `${employee.firstName} ${employee.lastName}`,
        email: normalizedEmail,
        department: employee.department,
        role: employee.role || 'employee',
        status: employee.status || 'pending',
        hireDate: employee.hireDate,
        phone: employee.phone,
        emergencyContact: employee.emergencyContact,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    })
  } catch (error) {
    console.error('Error creating employee credential:', error)
    res.status(500).json({ error: 'Failed to create employee credential' })
  }
})

/**
 * PUT /api/employee-credentials/:id
 * Actualizar una credencial de empleado
 */
app.put('/api/employee-credentials/:id', (req, res) => {
  try {
    const id = req.params.id
    const updates = req.body

    const existing = getEmployeeById(id)
    if (!existing) {
      return res.status(404).json({ error: 'Employee credential not found' })
    }

    // Actualizar en tabla SQL
    updateEmployee(id, updates)

    // Si se actualizan ciertos campos, también actualizar el perfil en data_store
    if (updates.firstName || updates.lastName || updates.department) {
      const profile = getRecord('user-profiles', id)
      if (profile) {
        const updatedProfile = {
          ...profile,
          firstName: updates.firstName || profile.firstName,
          lastName: updates.lastName || profile.lastName,
          department: updates.department || profile.department,
          fullName: `${updates.firstName || profile.firstName} ${updates.lastName || profile.lastName}`,
          displayName: `${updates.firstName || profile.firstName} ${updates.lastName || profile.lastName}`,
          updatedAt: Date.now()
        }
        updateRecord('user-profiles', updatedProfile)
      }
    }

    // Obtener empleado actualizado
    const updated = getEmployeeById(id)
    const credential = {
      id: updated.id,
      fullName: updated.full_name,
      email: updated.email,
      department: updated.department,
      role: updated.role,
      status: updated.status,
      hireDate: updated.hire_date,
      phone: updated.phone,
      emergencyContact: updated.emergency_contact,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    }

    res.json({ data: credential })
  } catch (error) {
    console.error('Error updating employee credential:', error)
    res.status(500).json({ error: 'Failed to update employee credential' })
  }
})

/**
 * DELETE /api/employee-credentials/:id
 * Eliminar una credencial de empleado y sus registros relacionados
 */
app.delete('/api/employee-credentials/:id', (req, res) => {
  try {
    const id = req.params.id

    const existing = getEmployeeById(id)
    if (!existing) {
      return res.status(404).json({ error: 'Employee credential not found' })
    }

    // Eliminar todos los registros relacionados en una transacción
    const transaction = db.transaction(() => {
      deleteEmployee(id)  // Tabla SQL
      deleteStmt.run('user-profiles', id)  // data_store
      deleteStmt.run('auth-users', id)     // data_store
    })

    transaction()

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting employee credential:', error)
    res.status(500).json({ error: 'Failed to delete employee credential' })
  }
})

// ============================================================================
// Migration Utilities (temporal)
// ============================================================================

/**
 * POST /api/employees/regenerate-auth
 * Regenerar auth-users y user-profiles desde employee_credentials SQL table
 * TEMPORAL: Solo para migración de datos existentes
 */
app.post('/api/employees/regenerate-auth', (req, res) => {
  try {
    const employees = getAllEmployees()
    
    if (employees.length === 0) {
      return res.json({ message: 'No employees found in SQL table' })
    }

    const transaction = db.transaction(() => {
      employees.forEach(emp => {
        const timestamp = emp.created_at || Date.now()
        
        // Generar password temporal (será reemplazado en primer login)
        const tempPassword = `Welcome${Math.random().toString(36).slice(2, 10)}!`
        const { salt, hash } = hashPassword(tempPassword)
        
        // Extraer firstName y lastName de full_name
        const nameParts = emp.full_name.split(' ')
        const firstName = nameParts[0] || 'Unknown'
        const lastName = nameParts.slice(1).join(' ') || 'User'

        // Crear auth-user
        const authRecord = {
          id: emp.id,
          email: emp.email,
          role: emp.role || 'employee',
          passwordSalt: salt,
          passwordHash: hash,
          createdAt: timestamp,
          updatedAt: Date.now(),
          passwordChangedAt: timestamp,
          requiresPasswordChange: true
        }

        // Crear user-profile
        const profile = {
          id: emp.id,
          email: emp.email,
          firstName,
          lastName,
          fullName: emp.full_name,
          displayName: emp.full_name,
          department: emp.department || 'General',
          role: emp.role || 'employee',
          createdAt: timestamp,
          lastLoginAt: null,
          preferences: {
            highContrast: false,
            textSize: 'normal',
            reduceMotion: false,
            disableSoundEffects: false,
            avatar: undefined,
            displayName: emp.full_name
          }
        }

        insertRecord('auth-users', authRecord)
        insertRecord('user-profiles', profile)
      })
    })

    transaction()

    res.json({ 
      message: `Successfully regenerated auth records for ${employees.length} employees`,
      count: employees.length
    })
  } catch (error) {
    console.error('Error regenerating auth records:', error)
    res.status(500).json({ error: 'Failed to regenerate auth records' })
  }
})

// ============================================================================
// Error Handler
// ============================================================================

app.use((err, req, res, _next) => {
  console.error('Unhandled error in API', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`SQL persistence API listening on port ${PORT}`)
})
