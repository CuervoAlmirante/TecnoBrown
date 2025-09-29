import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function mapRow(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price ?? 0,
    originalPrice: p.original_price ?? null,
    category: p.category || 'otros',
    description: p.description || '',
    features: Array.isArray(p.features) ? p.features : [],
    images: Array.isArray(p.images) ? p.images : [],
    inStock: !!p.in_stock,
    featured: !!p.featured,
    rating: typeof p.rating === 'number' ? p.rating : 0,
    reviews: typeof p.reviews === 'number' ? p.reviews : 0,
    weight: p.weight || '',
    ingredients: p.ingredients || ''
  }
}

export function useCatalog({ category = 'all' } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false })

        if (category && category !== 'all') {
          query = query.eq('category', category)
        }

        const { data, error } = await query
        if (error) throw error

        const mapped = (data || []).map(mapRow)
        if (alive) setProducts(mapped)
      } catch (e) {
        if (alive) setError(e.message || 'No se pudo cargar el catálogo')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [category])

  const categories = useMemo(() => {
    const cats = [
      'all',
      'auriculares',
      'smartwatchs',
      'cargadores',
      'btParlantes',
      'accesoriosPc',
      'cables',
      'accesoriosCel',
    ]

    const counts = Object.fromEntries(
      cats.map(c => [
        c,
        c === 'all'
          ? products.length
          : products.filter(p => p.category === c).length
      ])
    )

    return [
      { id: 'all',           name: 'Todos los productos',    count: counts.all },
      { id: 'auriculares',   name: 'Auriculares',            count: counts.auriculares },
      { id: 'smartwatchs',   name: 'Smartwatchs',            count: counts.smartwatchs },
      { id: 'cargadores',    name: 'Cargadores',             count: counts.cargadores },
      { id: 'btParlantes',   name: 'Parlantes Bluetooth',    count: counts.btParlantes },
      { id: 'accesoriosPc',  name: 'Accesorios de PC',       count: counts.accesoriosPc },
      { id: 'cables',        name: 'Cables',                 count: counts.cables },
      { id: 'accesoriosCel', name: 'Accesorios para celular',count: counts.accesoriosCel },
    ]
  }, [products])

  const featuredProducts = useMemo(
    () => products.filter(p => p.featured),
    [products]
  )

  return { products, categories, featuredProducts, loading, error }
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return mapRow(data)
}
