#!/usr/bin/env node
/**
 * CLI Script: Create User
 * Usage: npm run create-user <tenantId> <email> <firstName> <lastName> <role> [curp] [rfc] [nss]
 * 
 * Examples:
 *   npm run create-user tenant-demo student@demo.com Juan "Pérez García" student
 *   npm run create-user tenant-kainet mentor@kainet.mx Ana "López Torres" mentor LOTA850315MDFPRN09 LOTA850315ABC ABC12345678
 */

import 'dotenv/config';
import { initializeCosmos } from '../services/cosmosdb.service';
import { createUser } from '../functions/UserFunctions';
import { UserRole } from '../models/User';

function showUsage() {
  console.log(`
📝 Uso: npm run create-user <tenantId> <email> <firstName> <lastName> <role> [curp] [rfc] [nss]

Roles válidos: admin, mentor, student

Ejemplos:
  npm run create-user tenant-demo student@demo.com Juan "Pérez García" student
  npm run create-user tenant-kainet mentor@kainet.mx Ana "López Torres" mentor LOTA850315MDFPRN09 LOTA850315ABC ABC12345678

Campos opcionales de cumplimiento mexicano:
  curp: Clave Única de Registro de Población (18 caracteres)
  rfc:  Registro Federal de Contribuyentes (13 caracteres)
  nss:  Número de Seguridad Social (11 dígitos)
  `);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    showUsage();
    process.exit(1);
  }
  
  const [tenantId, email, firstName, lastName, role, curp, rfc, nss] = args;
  
  // Validate role
  const validRoles: UserRole[] = ['admin', 'mentor', 'student'];
  if (!validRoles.includes(role as UserRole)) {
    console.error(`❌ Error: Rol "${role}" no válido. Usa: admin, mentor o student`);
    process.exit(1);
  }
  
  try {
    // Connect to Cosmos DB
    await initializeCosmos();
    console.log('✅ Cosmos DB connected\n');
    
    console.log(`🔨 Creando usuario "${firstName} ${lastName}" (${role})...`);
    
    const newUser = await createUser({
      tenantId,
      email,
      firstName,
      lastName,
      role: role as UserRole,
      curp,
      rfc,
      nss
    });
    
    console.log('\n✅ Usuario creado exitosamente!\n');
    console.log('📋 Detalles:');
    console.log(`   ID:        ${newUser.id}`);
    console.log(`   Tenant:    ${newUser.tenantId}`);
    console.log(`   Nombre:    ${newUser.firstName} ${newUser.lastName}`);
    console.log(`   Email:     ${newUser.email}`);
    console.log(`   Role:      ${newUser.role}`);
    console.log(`   Status:    ${newUser.status}`);
    
    if (newUser.curp) {
      console.log(`   CURP:      ${newUser.curp}`);
    }
    if (newUser.rfc) {
      console.log(`   RFC:       ${newUser.rfc}`);
    }
    if (newUser.nss) {
      console.log(`   NSS:       ${newUser.nss}`);
    }
    
    console.log(`   XP:        ${newUser.totalXP}`);
    console.log(`   Level:     ${newUser.level}`);
    console.log(`   Creado:    ${newUser.createdAt}`);
    
    console.log(`\n🎉 ¡Listo! Ahora puedes usar userId: "${newUser.id}"`);
    
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
