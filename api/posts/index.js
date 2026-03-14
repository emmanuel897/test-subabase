import { getSupabase } from '../_supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const supabase = getSupabase()

  try {
    if (req.method === 'GET') {
      const { search, all } = req.query

      let query = supabase
        .from('posts')
        .select(`*, profiles(id, name, email)`)
        .order('created_at', { ascending: false })

      if (!all) query = query.eq('published', true)
      if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)

      const { data, error } = await query
      if (error) throw error
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const { title, content, author_id, published = false } = req.body

      if (!title || !author_id) {
        return res.status(400).json({ error: 'title and author_id are required' })
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({ title, content, author_id, published })
        .select(`*, profiles(id, name, email)`)
        .single()

      if (error) throw error
      return res.status(201).json(data)
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
