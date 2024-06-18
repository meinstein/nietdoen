import {
  Button,
  FileInput,
  Group,
  Image,
  Radio,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useGeolocation } from '@uidotdev/usehooks'
import { addDoc, collection } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import React, { useEffect, useState } from 'react'
import { db, model, storage } from './Auth'

type AIResponse = {
  fonts: string[]
  colors: string[]
  text_original: string[]
  text_english_translation: string[]
  sign_location: string[]
}

type AIResponseKeys = keyof AIResponse

export const Dashboard = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<string>('dutch')
  const [res, setRes] = useState<AIResponse | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [storageUrl, setStorageUrl] = useState<string | null>(null)
  const state = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  })

  useEffect(() => {
    if (!file) {
      setRes(null)
      setStorageUrl(null)
    }
  }, [file])

  const onAnalyze = async () => {
    if (!file) return

    setError(null)
    setLoading(true)

    try {
      const imageId = Date.now()
      const storageRef = ref(storage, `images/${imageId}`)
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type,
      })
      const mimeType = uploadResult.metadata.contentType
      const storageUrl = uploadResult.ref.toString()
      setStorageUrl(storageUrl)

      const response_fields: AIResponseKeys[] = [
        'fonts',
        'colors',
        'text_original',
        'text_english_translation',
        'sign_location',
      ]

      const prompt = JSON.stringify({
        instructions: `This is a picture of a sign written in ${language} that forbids bicycles from being parked here. Supply values for the following fields. All values must be arrays of strings.`,
        response_fields,
      })

      if (!mimeType) throw new Error('No MIME type')

      const imagePart = {
        fileData: {
          mimeType,
          fileUri: storageUrl,
        },
      }

      // To generate text output, call generateContent with the text input
      const { response } = await model.generateContent([prompt, imagePart])

      setRes(JSON.parse(response.text()))
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const onSave = async () => {
    if (!res) return
    setLoading(true)

    const data = {
      storageUrl,
      colors: res.colors,
      fonts: res.fonts,
      location: res.sign_location,
      text: res.text_original,
      translation: res.text_english_translation,
      lat: state.latitude,
      lon: state.longitude,
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
      {res && <TagsInput label='Colors' defaultValue={res.colors} />}
      {res && <TagsInput label='Fonts' defaultValue={res.fonts} />}
      {res && <TagsInput label='Location' defaultValue={res.sign_location} />}
      {res && <TagsInput label='Text' defaultValue={res.text_original} />}
      {res && <TagsInput label='English Translation' defaultValue={res.text_english_translation} />}
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
