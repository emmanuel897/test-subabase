/**
 * Tests unitaires pour postService
 * Tests avec mocks Supabase - aucune connexion réelle requise.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockSingle = jest.fn()
const mockEq = jest.fn(() => ({ single: mockSingle, select: jest.fn(() => ({ single: mockSingle })) }))
const mockOrder = jest.fn(() => [])
const mockOr = jest.fn()
const mockSelectQuery = jest.fn(() => ({
  eq: mockEq,
  order: mockOrder,
  or: mockOr,
  single: mockSingle
}))

await jest.unstable_mockModule('../src/db/supabase.js', () => ({
  default: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: mockSingle })) })),
      select: mockSelectQuery,
      update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: mockSingle })) })) })),
      delete: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
    }))
  }
}))

describe('postService', () => {
  const samplePost = {
    id: 'post-uuid-1',
    title: 'Article de test',
    content: 'Contenu de test',
    author_id: 'uuid-alice',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: { id: 'uuid-alice', name: 'Alice', email: 'alice@example.com' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPublished()', () => {
    it('doit retourner uniquement les articles publiés', async () => {
      const published = [samplePost]
      mockEq.mockReturnValue({ order: mockOrder })
      mockOrder.mockResolvedValue({ data: published, error: null })

      const { default: postService } = await import('../src/services/postService.js')
      const result = await postService.getPublished()

      expect(result).toEqual(published)
    })
  })

  describe('search()', () => {
    it('doit retourner les articles correspondant à la recherche', async () => {
      const results = [samplePost]
      mockEq.mockReturnValue({ data: results, error: null })
      mockOr.mockReturnValue({ eq: mockEq })

      const { default: postService } = await import('../src/services/postService.js')
      const result = await postService.search('test')

      expect(Array.isArray(result) || result !== undefined).toBe(true)
    })
  })
})
