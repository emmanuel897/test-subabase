import supabase from '../db/supabase.js'

export const postService = {
  // CREATE
  async create(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        profiles (id, name, email)
      `)
      .single()

    if (error) throw error
    return data
  },

  // READ - récupérer tous les articles publiés avec l'auteur
  async getPublished() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (id, name, email),
        post_tags (
          tags (id, name)
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // READ - récupérer tous les articles (publiés et non publiés)
  async getAll() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (id, name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // READ - récupérer un article par ID
  async getById(id) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (id, name, email),
        post_tags (
          tags (id, name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // READ - articles d'un auteur
  async getByAuthor(authorId) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // UPDATE
  async update(id, updates) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // PUBLISH - publier un article
  async publish(id) {
    return this.update(id, { published: true })
  },

  // DELETE
  async delete(id) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Recherche full-text
  async search(query) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (id, name, email)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('published', true)

    if (error) throw error
    return data
  }
}

export default postService
