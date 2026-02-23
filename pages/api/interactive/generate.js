import { validate, generateInteractiveSchema } from '../../../lib/validate'

/**
 * POST /api/interactive/generate
 * AI story generation skeleton
 * Full generation should use the local script (Vercel 60s timeout too short)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate input
  const result = validate(generateInteractiveSchema, req.body)
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: result.errors
    })
  }

  // Return guidance to use local script
  // Full AI generation with audio takes 2-5 minutes (way beyond 60s Vercel timeout)
  res.status(200).json({
    success: true,
    message: 'Interactive story generation must be run locally due to Vercel timeout limits.',
    instructions: [
      'Run locally: node scripts/generate-interactive-story.js --category Horror --dialect Hindi --audio --upload',
      'Flags: --title "Custom Title" --category Category --dialect Dialect --difficulty easy|medium|hard',
      'Optional: --audio (generate ElevenLabs audio) --upload (push to S3)',
      'Without --upload, JSON is printed to stdout for manual addition to data/interactive-stories.json',
    ],
    validatedInput: result.data,
  })
}
