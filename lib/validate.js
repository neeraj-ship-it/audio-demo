const { z } = require('zod');

// ── Auth Schemas ──────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  preferredLanguage: z.string().max(50).optional().default('Hindi'),
});

const loginSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z.string().min(1).max(128),
});

// ── Rating Schemas ────────────────────────────────────

const ratingSchema = z.object({
  userId: z.string().min(1).max(100),
  userName: z.string().min(1).max(100).trim(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).trim().optional().default(''),
});

const storyIdSchema = z.string().regex(/^\d+$/, 'Invalid story ID');

// ── Story Schemas ─────────────────────────────────────

const ALLOWED_CATEGORIES = [
  'Romance', 'Horror', 'Thriller', 'Comedy',
  'Spiritual', 'Motivation', 'Culture', 'Family',
  'Drama', 'Adventure', 'Mystery'
];

const ALLOWED_DIALECTS = [
  'Hindi', 'Bhojpuri', 'Gujarati', 'Haryanvi', 'Rajasthani'
];

const generateStorySchema = z.object({
  title: z.string().min(1).max(200).trim(),
  category: z.string().refine(
    val => ALLOWED_CATEGORIES.includes(val),
    { message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` }
  ),
  dialect: z.string().refine(
    val => ALLOWED_DIALECTS.includes(val),
    { message: `Dialect must be one of: ${ALLOWED_DIALECTS.join(', ')}` }
  ).optional(),
});

// ── Library Schemas ───────────────────────────────────

const backupSchema = z.object({
  label: z.string().max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Label must be alphanumeric').optional(),
});

const restoreSchema = z.object({
  filename: z.string()
    .max(200)
    .regex(/^[a-zA-Z0-9_.-]+\.json$/, 'Invalid filename')
    .refine(val => !val.includes('..'), 'Path traversal not allowed'),
});

// ── Interactive Story Schemas ────────────────────────

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'];
const ALLOWED_ENDING_TYPES = ['good', 'bad', 'secret'];

const interactiveChoiceSchema = z.object({
  id: z.string().min(1).max(100),
  text: z.string().min(1).max(500),
  emoji: z.string().max(10).optional().default(''),
  nextScene: z.string().min(1).max(100),
  consequence: z.string().max(500).optional().default(''),
});

const interactiveSceneSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  text: z.string().min(1).max(5000),
  audioUrl: z.string().max(2000).optional().default(''),
  imageUrl: z.string().max(2000).optional().default(''),
  isEnding: z.boolean(),
  endingType: z.string().refine(
    val => ALLOWED_ENDING_TYPES.includes(val),
    { message: `Ending type must be one of: ${ALLOWED_ENDING_TYPES.join(', ')}` }
  ).optional(),
  endingTitle: z.string().max(200).optional(),
  endingEmoji: z.string().max(10).optional(),
  choices: z.array(interactiveChoiceSchema),
});

const interactiveStorySchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200).trim(),
  category: z.string().refine(
    val => ALLOWED_CATEGORIES.includes(val),
    { message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` }
  ),
  dialect: z.string().refine(
    val => ALLOWED_DIALECTS.includes(val),
    { message: `Dialect must be one of: ${ALLOWED_DIALECTS.join(', ')}` }
  ).optional(),
  description: z.string().max(1000).optional().default(''),
  difficulty: z.string().refine(
    val => ALLOWED_DIFFICULTIES.includes(val),
    { message: `Difficulty must be one of: ${ALLOWED_DIFFICULTIES.join(', ')}` }
  ),
  estimatedTime: z.string().max(50).optional().default('10-15 min'),
  totalScenes: z.number().int().min(1).max(100),
  totalEndings: z.number().int().min(1).max(20),
  startScene: z.string().min(1).max(100),
});

const interactiveProgressSchema = z.object({
  userId: z.string().min(1).max(100),
  storyId: z.string().min(1).max(100),
  currentScene: z.string().min(1).max(100),
  choiceHistory: z.array(z.object({
    sceneId: z.string(),
    choiceId: z.string(),
    timestamp: z.string(),
  })),
  endingsDiscovered: z.array(z.string()),
  completionPercentage: z.number().min(0).max(100),
  totalChoicesMade: z.number().int().min(0),
});

const generateInteractiveSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  category: z.string().refine(
    val => ALLOWED_CATEGORIES.includes(val),
    { message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` }
  ),
  dialect: z.string().refine(
    val => ALLOWED_DIALECTS.includes(val),
    { message: `Dialect must be one of: ${ALLOWED_DIALECTS.join(', ')}` }
  ).optional(),
  difficulty: z.string().refine(
    val => ALLOWED_DIFFICULTIES.includes(val),
    { message: `Difficulty must be one of: ${ALLOWED_DIFFICULTIES.join(', ')}` }
  ).optional().default('medium'),
  sceneCount: z.number().int().min(5).max(20).optional().default(10),
  endingCount: z.number().int().min(2).max(5).optional().default(3),
});

// ── Comic Schemas ───────────────────────────────────

const ALLOWED_ART_STYLES = [
  'cinematic-bollywood', 'warm-romantic-bollywood', 'colorful-rajasthani-cartoon',
  'dark-horror', 'watercolor-indian', 'comic-book', 'manga-indian', 'realistic'
];

const ALLOWED_PANEL_LAYOUTS = ['full', 'split-horizontal', 'split-vertical'];

const comicTextOverlaySchema = z.object({
  type: z.enum(['narration', 'sound-effect']),
  text: z.string().min(1).max(500),
  position: z.enum(['top', 'bottom', 'center']),
  style: z.enum(['caption', 'bold', 'whisper']),
});

const comicDialogueSchema = z.object({
  character: z.string().min(1).max(100),
  text: z.string().min(1).max(500),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
  style: z.enum(['speech-bubble', 'thought-bubble', 'shout']),
});

const comicPanelSchema = z.object({
  id: z.string().min(1).max(100),
  order: z.number().int().min(1).max(50),
  imageUrl: z.string().max(2000).optional().default(''),
  imagePrompt: z.string().max(2000).optional().default(''),
  layout: z.string().refine(
    val => ALLOWED_PANEL_LAYOUTS.includes(val),
    { message: `Layout must be one of: ${ALLOWED_PANEL_LAYOUTS.join(', ')}` }
  ).optional().default('full'),
  textOverlays: z.array(comicTextOverlaySchema).optional().default([]),
  dialogue: z.array(comicDialogueSchema).optional().default([]),
  audioUrl: z.string().max(2000).optional().default(''),
  narrationText: z.string().max(2000).optional().default(''),
});

const comicCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  color: z.string().max(20).optional().default('#667eea'),
});

const comicSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200).trim(),
  category: z.string().refine(
    val => ALLOWED_CATEGORIES.includes(val),
    { message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` }
  ),
  dialect: z.string().refine(
    val => ALLOWED_DIALECTS.includes(val),
    { message: `Dialect must be one of: ${ALLOWED_DIALECTS.join(', ')}` }
  ).optional(),
  description: z.string().max(1000).optional().default(''),
  totalPanels: z.number().int().min(1).max(50),
  estimatedTime: z.string().max(50).optional().default('3-5 min'),
  artStyle: z.string().refine(
    val => ALLOWED_ART_STYLES.includes(val),
    { message: `Art style must be one of: ${ALLOWED_ART_STYLES.join(', ')}` }
  ).optional().default('cinematic-bollywood'),
  hasAudio: z.boolean().optional().default(false),
});

const comicProgressSchema = z.object({
  userId: z.string().min(1).max(100),
  comicId: z.string().min(1).max(100),
  currentPanel: z.number().int().min(0),
  panelsRead: z.number().int().min(0),
  completed: z.boolean(),
  readingTimeSeconds: z.number().int().min(0).optional().default(0),
});

const generateComicSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  category: z.string().refine(
    val => ALLOWED_CATEGORIES.includes(val),
    { message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` }
  ),
  dialect: z.string().refine(
    val => ALLOWED_DIALECTS.includes(val),
    { message: `Dialect must be one of: ${ALLOWED_DIALECTS.join(', ')}` }
  ).optional(),
  artStyle: z.string().refine(
    val => ALLOWED_ART_STYLES.includes(val),
    { message: `Art style must be one of: ${ALLOWED_ART_STYLES.join(', ')}` }
  ).optional().default('cinematic-bollywood'),
  panelCount: z.number().int().min(4).max(20).optional().default(8),
});

// ── Generation Schemas ────────────────────────────────

const scheduleSchema = z.object({
  secret: z.string().min(1),
  count: z.number().int().min(1).max(10).optional().default(2),
});

// ── Validation Helper ─────────────────────────────────

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}

function validateRequest(schema) {
  return (req, res, next) => {
    const result = validate(schema, req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: result.errors,
      });
    }
    req.validatedBody = result.data;
    if (next) next();
    return result;
  };
}

module.exports = {
  // Schemas
  signupSchema,
  loginSchema,
  ratingSchema,
  storyIdSchema,
  generateStorySchema,
  backupSchema,
  restoreSchema,
  scheduleSchema,
  // Interactive Schemas
  interactiveStorySchema,
  interactiveSceneSchema,
  interactiveChoiceSchema,
  interactiveProgressSchema,
  generateInteractiveSchema,
  // Helpers
  validate,
  validateRequest,
  // Comic Schemas
  comicSchema,
  comicPanelSchema,
  comicDialogueSchema,
  comicTextOverlaySchema,
  comicCharacterSchema,
  comicProgressSchema,
  generateComicSchema,
  // Constants
  ALLOWED_CATEGORIES,
  ALLOWED_DIALECTS,
  ALLOWED_DIFFICULTIES,
  ALLOWED_ENDING_TYPES,
  ALLOWED_ART_STYLES,
  ALLOWED_PANEL_LAYOUTS,
};
