import { Button, FileInput, Image, Stack, TagsInput, Text, TextInput, Title } from '@mantine/core'
import { useGeolocation } from '@uidotdev/usehooks'
import { ref, uploadBytes } from 'firebase/storage'
import React, { useEffect, useState } from 'react'
import { model, storage } from './Auth'

type AIResponse = {
  colors: string[]
  materials: string[]
  shapes: string[]
  icons: string[]
  location: string[]
  text: string[]
  fonts: string[]
}

export const Dashboard = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState<AIResponse | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const state = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  })

  useEffect(() => {
    if (!file) {
      setRes(null)
    }
  }, [file])

  const onClick = async () => {
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

      const prompt = JSON.stringify({
        prompt:
          'This is a picture of a sign. Describe it. Respond to the following fields. Each field should be an array of values.',
        response_fields: [
          'colors',
          'materials',
          'shapes',
          'icons',
          'location',
          'text',
          'fonts',
          'language',
          'english_translation',
        ],
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

      console.log(JSON.parse(response.text()))

      setRes(JSON.parse(response.text()))
    } catch (error) {
      setError(error.message)
    }
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
        capture='environment'
        accept='image/*'
      />
      {file && (
        <Image
          mah={200}
          w='auto'
          fit='contain'
          src={URL.createObjectURL(file)}
          alt='Uploaded image'
        />
      )}
      <TextInput disabled label='Coordinates' value={`${state.latitude}, ${state.longitude}`} />
      {res && <TagsInput label='Colors' defaultValue={res.colors} />}
      {res && <TagsInput label='Fonts' defaultValue={res.fonts} />}
      {res && <TagsInput label='Shapes' defaultValue={res.shapes} />}
      {res && <TagsInput label='Text' defaultValue={res.text} />}
      {error && <Text c='red'>{error}</Text>}
      <Button disabled={!file} loading={loading} onClick={onClick}>
        Generate
      </Button>
    </Stack>
  )
}
