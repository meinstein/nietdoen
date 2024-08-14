export const KEYS = [
  'casing',
  'design',
  'tone',
  'shape',
  'colors',
  'text',
  'symbols',
  'condition',
  'location',
  'sentiment',
  'material',
] as const

export type Field = (typeof KEYS)[number]

type AIPrompt = {
  field: Field
  response_type: 'string' | 'array'
  instructions: string
  options?: string[]
}

export const Options = {
  LANGUAGES: ['dutch', 'english'],
  DESIGN: ['text', 'symbol', 'both'],
  COLORS: ['white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'brown'],
  CASING: ['sentence', 'title', 'upper', 'lower', 'other', 'n/a'],
  CONDITION: ['new', 'good', 'fair', 'poor'],
  LOCATION: ['window', 'fence', 'wall', 'door', 'ground', 'other'],
  SENTIMENT: ['positive', 'negative', 'neutral'],
  MATERIAL: ['metal', 'plastic', 'wood', 'paper', 'sticker', 'concrete', 'other'],
  TONE: ['formal', 'informal', 'neutral', 'n/a'],
  SHAPE: ['rectangular', 'circular', 'triangular', 'other'],
  SYMBOLS: [
    'bicycle',
    'moped',
    'lock',
    'tow truck',
    'parking symbol',
    'red circle and backslash',
    'red backslash only',
    'red circle only',
    'other',
  ],
}

export const response_fields: AIPrompt[] = [
  {
    field: 'design',
    instructions:
      'Is the "do not park" sign in the image expressed as text only or as a symbol only or as both?',
    response_type: 'string',
    options: Options.DESIGN,
  },
  {
    field: 'casing',
    instructions:
      'What is the casing of the sign text? Select one from the options below. Return "n/a" if not applicable because the image is a symbol only.',
    response_type: 'string',
    options: Options.CASING,
  },
  {
    field: 'tone',
    instructions:
      'What is the tone of the sign text? Select one from the option below. Return "n/a" if not applicable (eg if the sign is a symbol only).',
    response_type: 'string',
    options: Options.TONE,
  },
  {
    field: 'shape',
    instructions: 'What is the shape of the sign? Leave blank if not applicable.',
    response_type: 'string',
    options: Options.SHAPE,
  },
  {
    field: 'colors',
    instructions:
      'Select all colors that are visible on the sign itself. Only select the colors from the options below.',
    response_type: 'array',
    options: Options.COLORS,
  },
  {
    field: 'text',
    instructions:
      'What does the text on the sign literally say? Please provide the text as a string. Include any line breaks. If the sign is a symbol, return "n/a".',
    response_type: 'string',
  },
  {
    field: 'symbols',
    instructions:
      'What symbols, if any, are present on the sign? If none, return an empty array. Only select from the options below.',
    response_type: 'array',
    options: Options.SYMBOLS,
  },
  {
    field: 'condition',
    instructions:
      'What is the condition of the sign? Only select the condition from the options below.',
    response_type: 'string',
    options: Options.CONDITION,
  },
  {
    field: 'location',
    instructions: 'Where is the sign located? Only select the location from the options below.',
    response_type: 'string',
    options: Options.LOCATION,
  },
  {
    field: 'sentiment',
    instructions:
      'What is the sentiment of the sign? Only select the sentiment from the options below. To be negative, the sign must be threatening something negative, like a fine or a tow. To be positive, the sign must use kind words or encouraging symbols. If the sign is neutral, it is neither positive nor negative.',
    response_type: 'string',
    options: Options.SENTIMENT,
  },
  {
    field: 'material',
    instructions:
      'What is the primary material of the sign? Only select the material from the options below.',
    response_type: 'string',
    options: Options.MATERIAL,
  },
]
