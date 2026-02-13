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
  // Helpers
  validate,
  validateRequest,
  // Constants
  ALLOWED_CATEGORIES,
  ALLOWED_DIALECTS,
};
