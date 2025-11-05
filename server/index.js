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
        
        // Verificar si el usuario ya existe
        const existingAuth = getRecords('auth-users').find(u => u.email === normalizedEmail)
        if (existingAuth) {
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

        // Guardar credenciales temporales
        const credentialRecord = {
          ...employee,
          status: 'pending',
          createdAt: timestamp,
          expiresAt: timestamp + 30 * 24 * 60 * 60 * 1000
        }

        insertRecord('auth-users', authRecord)
        insertRecord('user-profiles', profile)
        insertRecord('employee-credentials', credentialRecord)

        successful.push(credentialRecord)
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
    const employees = getRecords('employee-credentials')
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
    const credentials = getRecords('employee-credentials')
    
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

app.use((err, req, res, _next) => {
  console.error('Unhandled error in API', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`SQL persistence API listening on port ${PORT}`)
})
