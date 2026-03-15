/**
 * Tests unitaires pour profileService
 * Ces tests utilisent des mocks pour simuler Supabase sans connexion réelle.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// Mock du module Supabase
const mockSingle = jest.fn()
const mockSelect = jest.fn(() => ({ single: mockSingle }))
const mockInsert = jest.fn(() => ({ select: mockSelect }))
const mockEq = jest.fn(() => ({ single: mockSingle, select: mockSelect }))
const mockOrder = jest.fn(() => [])
const mockFrom = jest.fn(() => ({
  insert: mockInsert,
  select: jest.fn(() => ({ order: mockOrder, eq: mockEq, single: mockSingle })),
  update: jest.fn(() => ({ eq: mockEq })),
  delete: jest.fn(() => ({ eq: jest.fn(() => ({ error: null })) })),
}))

await jest.unstable_mockModule('../src/db/supabase.js', () => ({
  default: { from: mockFrom },
  supabase: { from: mockFrom }
}))

describe('profileService', () => {
  const sampleProfile = {
    id: 'uuid-alice',
    name: 'Alice Dupont',
    email: 'alice@example.com',
    age: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create()', () => {
    it('doit retourner le profil créé', async () => {
      mockSingle.mockResolvedValue({ data: sampleProfile, error: null })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockInsert.mockReturnValue({ select: mockSelect })

      const { default: profileService } = await import('../src/services/profileService.js')
      const result = await profileService.create({
        name: 'Alice Dupont',
        email: 'alice@example.com',
        age: 28
      })

      expect(result).toEqual(sampleProfile)
      expect(mockFrom).toHaveBeenCalledWith('profiles')
    })

    it('doit lever une erreur si Supabase échoue', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Email déjà utilisé' } })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockInsert.mockReturnValue({ select: mockSelect })

      const { default: profileService } = await import('../src/services/profileService.js')

      await expect(profileService.create({
        name: 'Alice',
        email: 'alice@example.com',
        age: 28
      })).rejects.toMatchObject({ message: 'Email déjà utilisé' })
    })
  })

  describe('getAll()', () => {
    it('doit retourner un tableau de profils', async () => {
      const profiles = [sampleProfile, { ...sampleProfile, id: 'uuid-bob', name: 'Bob' }]
      mockOrder.mockResolvedValue({ data: profiles, error: null })

      const { default: profileService } = await import('../src/services/profileService.js')
      const result = await profileService.getAll()

      expect(result).toEqual(profiles)
    })
  })
})
