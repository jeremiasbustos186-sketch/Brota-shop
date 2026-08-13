import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById, createProduct, updateProduct } from '../../services/productService'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import type { ProductCategory } from '../../types'

// Status discriminado para el formulario (L7)
type FormStatus = 'editing' | 'submitting' | 'uploading' | 'error'

const CATEGORIES: ProductCategory[] = ['suculentas', 'tropicales', 'cactus', 'exterior', 'accesorios']

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<FormStatus>('editing')
  const [loadingProduct, setLoadingProduct] = useState(isEditing)
  const [error, setError] = useState('')

  // Campos del form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState<ProductCategory>('suculentas')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  // Cargar datos al editar
  useEffect(() => {
    if (!id) return
    getProductById(id)
      .then((p) => {
        if (!p) { navigate('/admin/products'); return }
        setName(p.name)
        setDescription(p.description)
        setPrice(String(p.price))
        setStock(String(p.stock))
        setCategory(p.category)
        setImageUrl(p.imageUrl)
        setImagePreview(p.imageUrl)
      })
      .finally(() => setLoadingProduct(false))
  }, [id, navigate])

  // Upload de imagen a S3 vía presigned URL (L7)
  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    setError('')

    try {
      // 1. Pedir presigned URL al serverless function
      const res = await fetch('/api/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      })
      if (!res.ok) throw new Error('No se pudo obtener la URL de upload')
      const { url, publicUrl } = await res.json()

      // 2. Subir el archivo directamente a S3
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!uploadRes.ok) throw new Error('Error al subir la imagen')

      // 3. Guardar la URL pública
      setImageUrl(publicUrl)
      setImagePreview(publicUrl)
      setStatus('editing')
    } catch (err) {
      setError((err as Error).message)
      setStatus('error')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'submitting' || status === 'uploading') return

    setStatus('submitting')
    setError('')

    const data = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      imageUrl,
    }

    try {
      if (isEditing && id) {
        await updateProduct(id, data)
      } else {
        await createProduct(data)
      }
      navigate('/admin/products')
    } catch {
      setError('No se pudo guardar el producto. Intentá de nuevo.')
      setStatus('error')
    }
  }

  if (loadingProduct) return <LoadingState />

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl mb-2"
              onError={() => setImagePreview('')}
            />
          )}

          {/* Opción 1: pegar URL */}
          <div className="mb-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setImagePreview(e.target.value)
              }}
              placeholder="Pegá una URL de imagen (ej: Unsplash)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Opción 2: subir archivo (solo funciona en Vercel con S3) */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span>o subir archivo (requiere Vercel + S3)</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            aria-label="imagen"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {status === 'uploading' && (
            <p className="text-xs text-gray-400 mt-1">Subiendo imagen...</p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Precio *
            </label>
            <input
              id="price"
              type="number"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock *
            </label>
            <input
              id="stock"
              type="number"
              required
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            loading={status === 'submitting'}
            disabled={status === 'uploading' || status === 'submitting'}
          >
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/products')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
