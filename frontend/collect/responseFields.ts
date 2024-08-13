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
  CASING: ['sentence', 'title', 'upper', 'lower', 'other'],
  CONDITION: ['new', 'good', 'fair', 'poor'],
  LOCATION: ['window', 'fence', 'wall', 'door', 'ground', 'other'],
  SENTIMENT: ['positive', 'negative', 'neutral'],
  MATERIAL: ['metal', 'plastic', 'wood', 'paper', 'sticker', 'other'],
  TONE: ['formal', 'informal', 'neutral'],
  SHAPE: ['rectangular', 'circular', 'triangular', 'other'],
  SYMBOLS: [
    'bicycle',
    'moped',
    'lock',
    'tow truck',
    'parking symbol',
    'circle backslash',
    'red circle',
    'other',
  ],
}

export const response_fields: AIPrompt[] = [
  {
    field: 'design',
    instructions: 'Is the sign text only or symbol only or both?',
    response_type: 'string',
    options: Options.DESIGN,
  },
  {
    field: 'casing',
    instructions: 'What is the casing of the sign text?',
    response_type: 'string',
    options: Options.CASING,
  },
  {
    field: 'tone',
    instructions: 'What is the tone of the sign text?',
    response_type: 'string',
    options: Options.TONE,
  },
  {
    field: 'shape',
    instructions: 'What is the shape of the sign text?',
    response_type: 'string',
    options: Options.SHAPE,
  },
  {
    field: 'colors',
    instructions:
      'Select all colors that are present in the image. Only select the colors from the options below.',
    response_type: 'array',
    options: Options.COLORS,
  },
  {
    field: 'text',
    instructions:
      'What does the sign literally say? Please provide the text as a string. Include any line breaks.',
    response_type: 'string',
    options: Options.LANGUAGES,
  },
  {
    field: 'symbols',
    instructions:
      'What symbols, if any, are present on the sign? If none, return an empty array. Use the options below or provide a custom symbol.',
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
      'What is the sentiment of the sign? Only select the sentiment from the options below.',
    response_type: 'string',
    options: Options.SENTIMENT,
  },
  {
    field: 'material',
    instructions:
      'What is the material of the sign? Only select the material from the options below.',
    response_type: 'string',
    options: Options.MATERIAL,
  },
]
