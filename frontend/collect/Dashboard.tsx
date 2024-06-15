import { Button, Code, FileInput, Image, Stack, Text, Title } from '@mantine/core'
import { useGeolocation } from '@uidotdev/usehooks'
import React, { useState } from 'react'
import { model } from './Auth'

async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise(resolve => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string | null)?.split(',')[1])
    reader.readAsDataURL(file)
  })
  return {
    inlineData: {
      data: (await base64EncodedDataPromise) as string,
      mimeType: file.type as string,
    },
  }
}

export const Dashboard = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const state = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  })

  const onClick = async () => {
    setError(null)
    setLoading(true)

    try {
      const imagePart = await fileToGenerativePart(file)

      const prompt = JSON.stringify({
        prompt:
          'This is a picture of a sign. Describe it. Respond to the following fields. Each field should be an array of values.',
        response_fields: [
          'colors',
          'material',
          'shape',
          'location',
          'sentiment',
          'condition',
          'text',
        ],
      })

      // To generate text output, call generateContent with the text input
      const { response } = await model.generateContent([prompt, imagePart])

      setRes(response.text())
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
      {/* <Text>Lat: {state.latitude}</Text> */}
      {/* <Text>Long: {state.longitude}</Text> */}
      {res && <Code>{res}</Code>}
      {error && <Text c='red'>{error}</Text>}
      <Button disabled={!file} loading={loading} onClick={onClick}>
        Generate
      </Button>
    </Stack>
  )
}
