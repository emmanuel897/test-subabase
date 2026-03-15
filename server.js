import 'dotenv/config'
import express from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import profilesHandler from './api/profiles/index.js'
import profileHandler from './api/profiles/[id].js'
import postsHandler from './api/posts/index.js'
import postHandler from './api/posts/[id].js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.json())

// Routes API
app.all('/api/profiles/:id', (req, res) => {
  req.query.id = req.params.id
  return profileHandler(req, res)
})
app.all('/api/profiles', profilesHandler)

app.all('/api/posts/:id', (req, res) => {
  req.query.id = req.params.id
  return postHandler(req, res)
})
app.all('/api/posts', postsHandler)

// Client web
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
})
