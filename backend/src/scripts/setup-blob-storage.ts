/**
 * Script para configurar Azure Blob Storage
 * 
 * Este script:
 * 1. Verifica la conexión a Azure Storage
 * 2. Crea los containers necesarios si no existen
 * 3. Configura CORS para el frontend
 * 4. Verifica la configuración
 * 
 * Uso:
 *   npm run setup-blob-storage
 * 
 * Requisitos:
 *   - AZURE_STORAGE_CONNECTION_STRING en .env
 */

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface ContainerConfig {
  name: string;
  access: 'private' | 'blob' | 'container';
  cors?: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAgeInSeconds: number;
  };
}

// Configuración de containers
const CONTAINERS: ContainerConfig[] = [
  {
    name: 'tenant-logos',
    access: 'blob', // Público con URL, pero requiere autenticación para upload
    cors: {
      allowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://accesslearn.azurestaticapps.net'
      ].filter(Boolean),
      allowedMethods: ['GET', 'PUT', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
      maxAgeInSeconds: 3600
    }
  },
  {
    name: 'user-avatars',
    access: 'private',
    cors: {
      allowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://accesslearn.azurestaticapps.net'
      ].filter(Boolean),
      allowedMethods: ['GET', 'PUT', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
      maxAgeInSeconds: 3600
    }
  },
  {
    name: 'course-media',
    access: 'private',
    cors: {
      allowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://accesslearn.azurestaticapps.net'
      ].filter(Boolean),
      allowedMethods: ['GET', 'PUT', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
      maxAgeInSeconds: 3600
    }
  },
  {
    name: 'certificates',
    access: 'private',
    cors: {
      allowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://accesslearn.azurestaticapps.net'
      ].filter(Boolean),
      allowedMethods: ['GET', 'PUT', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
      maxAgeInSeconds: 3600
    }
  },
  {
    name: 'course-files',
    access: 'private',
    cors: {
      allowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://accesslearn.azurestaticapps.net'
      ].filter(Boolean),
      allowedMethods: ['GET', 'PUT', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
      maxAgeInSeconds: 3600
    }
  }
];

async function setupBlobStorage() {
  console.log('🚀 Configurando Azure Blob Storage...\n');

  // Verificar connection string
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ Error: AZURE_STORAGE_CONNECTION_STRING no está configurada en .env');
    console.error('\nPor favor, agrega la siguiente línea a tu archivo .env:');
    console.error('AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...');
    console.error('\nPuedes obtener la connection string desde:');
    console.error('Azure Portal > Storage Account > Access Keys > Connection string');
    process.exit(1);
  }

  try {
    // Crear BlobServiceClient
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // Verificar conexión
    console.log('✅ Conexión a Azure Storage establecida\n');

    // Crear containers
    console.log('📦 Creando containers...\n');
    
    for (const containerConfig of CONTAINERS) {
      try {
        const containerClient = blobServiceClient.getContainerClient(containerConfig.name);
        
        // Verificar si existe
        const exists = await containerClient.exists();
        
        if (exists) {
          console.log(`   ⚠️  Container "${containerConfig.name}" ya existe`);
        } else {
          // Crear container
          await containerClient.create({
            access: containerConfig.access
          });
          console.log(`   ✅ Container "${containerConfig.name}" creado (access: ${containerConfig.access})`);
        }

        // Configurar CORS si está definido
        if (containerConfig.cors) {
          try {
            const serviceProperties = await blobServiceClient.getProperties();
            const corsRules = serviceProperties.cors || [];
            
            // Verificar si ya existe una regla CORS para estos orígenes
            const existingRule = corsRules.find(rule => 
              rule.allowedOrigins.some(origin => 
                containerConfig.cors!.allowedOrigins.includes(origin)
              )
            );

            if (!existingRule) {
              // Agregar nueva regla CORS
              corsRules.push({
                allowedOrigins: containerConfig.cors.allowedOrigins.join(','),
                allowedMethods: containerConfig.cors.allowedMethods.join(','),
                allowedHeaders: containerConfig.cors.allowedHeaders.join(','),
                exposedHeaders: containerConfig.cors.exposedHeaders.join(','),
                maxAgeInSeconds: containerConfig.cors.maxAgeInSeconds
              });

              await blobServiceClient.setProperties({
                cors: corsRules
              });
              console.log(`   ✅ CORS configurado para "${containerConfig.name}"`);
            } else {
              console.log(`   ℹ️  CORS ya configurado para "${containerConfig.name}"`);
            }
          } catch (corsError: any) {
            console.warn(`   ⚠️  No se pudo configurar CORS para "${containerConfig.name}":`, corsError.message);
          }
        }

      } catch (error: any) {
        console.error(`   ❌ Error creando container "${containerConfig.name}":`, error.message);
      }
    }

    // Verificar configuración
    console.log('\n🔍 Verificando configuración...\n');
    
    const properties = await blobServiceClient.getProperties();
    console.log('   Storage Account:', properties.accountName);
    console.log('   SKU:', properties.skuName);
    console.log('   Kind:', properties.kind);
    
    // Listar containers
    console.log('\n📋 Containers existentes:');
    for await (const container of blobServiceClient.listContainers()) {
      console.log(`   - ${container.name} (${container.properties.publicAccess || 'private'})`);
    }

    console.log('\n✅ Configuración de Blob Storage completada exitosamente!\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Verifica que todos los containers se hayan creado correctamente');
    console.log('   2. Configura las variables de entorno en .env');
    console.log('   3. Continúa con la Fase 2: Implementación del servicio backend\n');

  } catch (error: any) {
    console.error('\n❌ Error configurando Blob Storage:', error.message);
    console.error('\nVerifica:');
    console.error('   - Que la connection string sea correcta');
    console.error('   - Que tengas permisos para crear containers');
    console.error('   - Que el Storage Account esté activo\n');
    process.exit(1);
  }
}

// Ejecutar script
setupBlobStorage()
  .then(() => {
    console.log('✨ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

