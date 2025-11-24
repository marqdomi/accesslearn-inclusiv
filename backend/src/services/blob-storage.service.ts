/**
 * Servicio para interactuar con Azure Blob Storage
 * 
 * Proporciona métodos para:
 * - Subir archivos a Blob Storage
 * - Generar SAS tokens para acceso seguro
 * - Eliminar archivos
 * - Obtener URLs de archivos
 */

import { 
  BlobServiceClient, 
  ContainerClient, 
  BlockBlobClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

class BlobStorageService {
  private blobServiceClient: BlobServiceClient;
  private connectionString: string;
  private accountName: string;
  private accountKey: string;

  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
    if (!this.connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
    }

    // Extraer account name y key de la connection string
    const accountNameMatch = this.connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = this.connectionString.match(/AccountKey=([^;]+)/);

    if (!accountNameMatch || !accountKeyMatch) {
      throw new Error('Invalid connection string format');
    }

    this.accountName = accountNameMatch[1];
    this.accountKey = accountKeyMatch[1];

    this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
  }

  /**
   * Obtener container client
   */
  private getContainerClient(containerName: string): ContainerClient {
    return this.blobServiceClient.getContainerClient(containerName);
  }

  /**
   * Subir archivo a Blob Storage
   * @param containerName Nombre del container
   * @param blobName Nombre del blob (path completo)
   * @param fileBuffer Buffer del archivo
   * @param contentType Content type del archivo (ej: 'image/jpeg')
   * @returns URL del archivo subido
   */
  async uploadFile(
    containerName: string,
    blobName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    const containerClient = this.getContainerClient(containerName);
    
    // Crear container si no existe
    await containerClient.createIfNotExists({
      access: undefined // Private
    });

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload file
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: contentType }
    });

    // Retornar URL del blob (será privada, necesitará SAS token para acceso)
    return blockBlobClient.url;
  }

  /**
   * Generar SAS token para acceso temporal a un blob
   * @param containerName Nombre del container
   * @param blobName Nombre del blob
   * @param expiresInMinutes Minutos hasta que expire el token (default: 60)
   * @returns URL completa con SAS token
   */
  async generateSasUrl(
    containerName: string,
    blobName: string,
    expiresInMinutes: number = 60
  ): Promise<string> {
    const containerClient = this.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Verificar que el blob existe
    const exists = await blockBlobClient.exists();
    if (!exists) {
      throw new Error(`Blob ${blobName} does not exist in container ${containerName}`);
    }

    // Crear credenciales compartidas
    const sharedKeyCredential = new StorageSharedKeyCredential(
      this.accountName,
      this.accountKey
    );

    // Generar SAS token
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'), // Solo lectura
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + expiresInMinutes * 60 * 1000)
      },
      sharedKeyCredential
    ).toString();

    // Retornar URL con SAS token
    return `${blockBlobClient.url}?${sasToken}`;
  }

  /**
   * Eliminar archivo de Blob Storage
   * @param containerName Nombre del container
   * @param blobName Nombre del blob
   */
  async deleteFile(containerName: string, blobName: string): Promise<void> {
    const containerClient = this.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Verificar que existe antes de eliminar
    const exists = await blockBlobClient.exists();
    if (!exists) {
      throw new Error(`Blob ${blobName} does not exist in container ${containerName}`);
    }

    await blockBlobClient.delete();
  }

  /**
   * Obtener URL del archivo (sin SAS token, será privada)
   * @param containerName Nombre del container
   * @param blobName Nombre del blob
   * @returns URL del blob (privada)
   */
  getFileUrl(containerName: string, blobName: string): string {
    const containerClient = this.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }

  /**
   * Verificar si un archivo existe
   * @param containerName Nombre del container
   * @param blobName Nombre del blob
   * @returns true si existe, false si no
   */
  async fileExists(containerName: string, blobName: string): Promise<boolean> {
    const containerClient = this.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return await blockBlobClient.exists();
  }
}

export const blobStorageService = new BlobStorageService();

