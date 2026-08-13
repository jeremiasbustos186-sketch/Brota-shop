import type { VercelRequest, VercelResponse } from '@vercel/node'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

/**
 * Vercel Serverless Function: genera una presigned URL para subir imágenes a S3.
 *
 * Las credenciales de AWS viven SOLO acá, como env vars sin prefijo VITE_ (L7/L9).
 * Nunca deben tocarse desde el código del cliente.
 *
 * Flow:
 * 1. Frontend llama POST /api/presign con { fileName, fileType }
 * 2. Esta function genera una presigned URL válida por 60 segundos
 * 3. Frontend sube el archivo directamente a S3 con PUT a esa URL
 * 4. Frontend guarda el publicUrl resultante en Firestore
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { fileName, fileType } = req.body as { fileName?: string; fileType?: string }

  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'fileName y fileType son requeridos' })
  }

  const bucket = process.env.AWS_S3_BUCKET_NAME
  const region = process.env.AWS_REGION ?? 'us-east-1'

  if (!bucket) {
    return res.status(500).json({ error: 'S3 bucket no configurado en el servidor' })
  }

  // Clave única para evitar colisiones
  const ext = fileName.split('.').pop()
  const key = `products/${randomUUID()}.${ext}`

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
  })

  try {
    const url = await getSignedUrl(client, command, { expiresIn: 60 })
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return res.status(200).json({ url, publicUrl })
  } catch {
    return res.status(500).json({ error: 'No se pudo generar la presigned URL' })
  }
}
