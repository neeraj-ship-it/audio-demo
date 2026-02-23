import { validate, generateComicSchema } from '../../../lib/validate'

/**
 * POST /api/comics/generate
 * Comic generation guidance
 * Full generation should use the local script (Vercel 60s timeout too short)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate input
  const result = validate(generateComicSchema, req.body)
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: result.errors
    })
  }

  // Return guidance to use local script
  // Image gen per panel (10 panels x 5-10s) + audio = way beyond 60s Vercel timeout
  res.status(200).json({
    success: true,
    message: 'Comic generation must be run locally due to Vercel timeout limits.',
    instructions: [
      'Run locally: node scripts/generate-comic-story.js --category Horror --dialect Hindi --upload',
      'Flags: --title "Custom Title" --category Category --dialect Dialect --artStyle cinematic-bollywood',
      'Optional: --audio (generate ElevenLabs narration per panel) --upload (push to S3)',
      'Optional: --panelCount 8 (number of panels, default 8)',
      'Without --upload, JSON is printed to stdout for manual addition to data/comic-stories.json',
    ],
    validatedInput: result.data,
  })
}
