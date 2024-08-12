import {
  Button,
  FileInput,
  Group,
  Image,
  Radio,
  Select,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { useGeolocation } from '@uidotdev/usehooks'
import { readAndCompressImage } from 'browser-image-resizer'
import { addDoc, collection, GeoPoint, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import React, { useEffect, useState } from 'react'
import { db, model, storage } from './Auth'

const KEYS = [
  'colors',
  'text',
  'symbols',
  'condition',
  'location',
  'sentiment',
  'material',
] as const

type Field = (typeof KEYS)[number]
type AIResponse = Record<Field, string | string[]>

type AIPrompt = {
  field: Field
  response_type: 'string' | 'array'
  instructions: string
  options?: string[]
  language?: string
}
const COLORS = ['white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'brown']
const CONDITION = ['new', 'good', 'fair', 'poor']
const LOCATION = ['window', 'fence', 'wall', 'door', 'ground', 'other']
const SENTIMENT = ['positive', 'negative', 'neutral']
const MATERIAL = ['metal', 'plastic', 'wood', 'paper', 'other']

export const Dashboard = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<string>('dutch')
  const [res, setRes] = useState<AIResponse | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [storageUrls, setStorageUrls] = useState<{ sm: string; lg: string } | null>(null)
  const state = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  })

  useEffect(() => {
    if (!file) {
      setRes(null)
      setStorageUrls(null)
    }
  }, [file])

  const onAnalyze = async () => {
    if (!file) return

    setError(null)
    setLoading(true)

    try {
      const imageId = Date.now()
      const storageRefSm = ref(storage, `images/${imageId}_sm`)
      const storageRefLg = ref(storage, `images/${imageId}_lg`)

      const [smallImage] = await Promise.all([
        readAndCompressImage(file, {
          quality: 0.75,
          maxWidth: 800,
          mimeType: file.type,
        }),
      ])

      const [uploadResultSm, uploadResultLg] = await Promise.all([
        uploadBytes(storageRefSm, smallImage, {
          contentType: file.type,
        }),
        uploadBytes(storageRefLg, file, {
          contentType: file.type,
        }),
      ])

      const mimeType = uploadResultSm.metadata.contentType

      setStorageUrls({
        sm: uploadResultSm.ref.toString(),
        lg: uploadResultLg.ref.toString(),
      })

      const response_fields: AIPrompt[] = [
        {
          field: 'colors',
          instructions:
            'Select all colors that are present in the image. Only select the colors from the options below.',
          response_type: 'array',
          options: COLORS,
        },
        {
          field: 'text',
          instructions:
            'What does the sign literally say? Please provide the text as a string. Include any line breaks.',
          response_type: 'string',
          language: `${language}`,
        },
        {
          field: 'symbols',
          instructions:
            'What symbols, if any, are present on the sign? If none, return an empty array.',
          response_type: 'array',
        },
        {
          field: 'condition',
          instructions:
            'What is the condition of the sign? Only select the condition from the options below.',
          response_type: 'string',
          options: CONDITION,
        },
        {
          field: 'location',
          instructions:
            'Where is the sign located? Only select the location from the options below.',
          response_type: 'string',
          options: LOCATION,
        },
        {
          field: 'sentiment',
          instructions:
            'What is the sentiment of the sign? Only select the sentiment from the options below.',
          response_type: 'string',
          options: SENTIMENT,
        },
        {
          field: 'material',
          instructions:
            'What is the material of the sign? Only select the material from the options below.',
          response_type: 'string',
          options: MATERIAL,
        },
      ]

      const prompt = JSON.stringify({
        context: `This is a picture of a sign written in ${language} that forbids bicycles from being parked here. Following the instructions in each of the response fields, please provide the requested information. The response should be an object with the following keys: ${KEYS.join()}.`,
        response_fields,
      })

      if (!mimeType) throw new Error('No MIME type')

      const imagePart = {
        fileData: {
          mimeType,
          fileUri: uploadResultLg.ref.toString(),
        },
      }

      // To generate text output, call generateContent with the text input
      const { response } = await model.generateContent([prompt, imagePart])
      console.log(JSON.parse(response.text()))
      setRes(JSON.parse(response.text()))
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const onSave = async () => {
    if (!res || !storageUrls || !state.latitude || !state.longitude) return
    setLoading(true)

    const data = {
      language,
      symbols: res.symbols,
      condition: res.condition,
      location: res.location,
      sentiment: res.sentiment,
      material: res.material,
      colors: res.colors,
      text: res.text,
      storage_urls: storageUrls,
      created_at: new Timestamp(Date.now() / 1000, 0),
      coordinates: new GeoPoint(state.latitude, state.longitude),
    }

    await addDoc(collection(db, 'signs'), data)
    setRes(null)
    setFile(null)
    setLoading(false)
  }

  return (
    <Stack p='lg'>
      <Title order={3}>Upload</Title>
      <FileInput
        clearable
        placeholder='Tap here to upload image'
        value={file}
        onChange={setFile}
        accept='image/*'
      />
      <Radio.Group name='language' label='Language' value={language} onChange={setLanguage}>
        <Group mt='xs'>
          <Radio value='dutch' label='Dutch' />
          <Radio value='english' label='English' />
        </Group>
      </Radio.Group>
      <TextInput disabled label='Coordinates' value={`${state.latitude}, ${state.longitude}`} />
      {file && (
        <Image
          mah={200}
          w='auto'
          fit='contain'
          src={URL.createObjectURL(file)}
          alt='Uploaded image'
        />
      )}
      {res && <Textarea label='Text' defaultValue={res.text} />}
      <Group>
        {res?.condition && (
          <Select
            flex={1}
            label='Condition'
            data={CONDITION}
            defaultValue={res.condition as string}
          />
        )}
        {res?.location && (
          <Select flex={1} label='Location' data={LOCATION} defaultValue={res.location as string} />
        )}
      </Group>
      <Group>
        {res?.sentiment && (
          <Select
            flex={1}
            label='Sentiment'
            data={SENTIMENT}
            defaultValue={res.sentiment as string}
          />
        )}
        {res?.material && (
          <Select flex={1} label='Material' data={MATERIAL} defaultValue={res.material as string} />
        )}
      </Group>
      {res?.colors && <TagsInput label='Colors' defaultValue={res.colors as string[]} />}
      {res?.symbols && <TagsInput label='Symbols' defaultValue={res.symbols as string[]} />}
      {error && <Text c='red'>{error}</Text>}
      {file && !res && (
        <Button loading={loading} onClick={onAnalyze}>
          Analyze
        </Button>
      )}
      {file && res && (
        <Button loading={loading} onClick={onSave}>
          Save
        </Button>
      )}
    </Stack>
  )
}
