/**
 * Point d'entrée principal - Démonstration des opérations Supabase
 *
 * Ce script montre comment effectuer des opérations CRUD complètes
 * avec Supabase et JavaScript (ES Modules).
 */

import profileService from './services/profileService.js'
import postService from './services/postService.js'

async function main() {
  console.log('=== Démo Supabase - Opérations CRUD ===\n')

  try {
    // ---- PROFILS ----
    console.log('--- Création de profils ---')

    const alice = await profileService.create({
      name: 'Alice Dupont',
      email: `alice_${Date.now()}@example.com`,
      age: 28
    })
    console.log('Profil créé :', alice)

    const bob = await profileService.create({
      name: 'Bob Martin',
      email: `bob_${Date.now()}@example.com`,
      age: 34
    })
    console.log('Profil créé :', bob)

    // Lire tous les profils
    console.log('\n--- Lecture de tous les profils ---')
    const allProfiles = await profileService.getAll()
    console.log(`${allProfiles.length} profil(s) trouvé(s)`)

    // Mettre à jour un profil
    console.log('\n--- Mise à jour du profil d\'Alice ---')
    const updatedAlice = await profileService.update(alice.id, { age: 29 })
    console.log('Profil mis à jour :', updatedAlice)

    // ---- ARTICLES ----
    console.log('\n--- Création d\'articles ---')

    const post1 = await postService.create({
      title: 'Mon premier article Supabase',
      content: 'Supabase est vraiment puissant !',
      author_id: alice.id,
      published: true
    })
    console.log('Article créé :', post1)

    const post2 = await postService.create({
      title: 'Brouillon en cours',
      content: 'Ce contenu est en cours de rédaction...',
      author_id: bob.id,
      published: false
    })
    console.log('Brouillon créé :', post2)

    // Lire les articles publiés
    console.log('\n--- Articles publiés ---')
    const published = await postService.getPublished()
    console.log(`${published.length} article(s) publié(s)`)

    // Recherche
    console.log('\n--- Recherche "Supabase" ---')
    const results = await postService.search('Supabase')
    console.log(`${results.length} résultat(s) pour "Supabase"`)

    // Publier le brouillon
    console.log('\n--- Publication du brouillon ---')
    const publishedPost = await postService.publish(post2.id)
    console.log('Article publié :', publishedPost.title)

    // ---- NETTOYAGE ----
    console.log('\n--- Nettoyage (suppression des données de test) ---')
    await postService.delete(post1.id)
    await postService.delete(post2.id)
    await profileService.delete(alice.id)
    await profileService.delete(bob.id)
    console.log('Données supprimées.')

    console.log('\n=== Démo terminée avec succès ! ===')

  } catch (err) {
    console.error('\nErreur :', err.message)
    if (err.hint) console.error('Indice :', err.hint)
    process.exit(1)
  }
}

main()
