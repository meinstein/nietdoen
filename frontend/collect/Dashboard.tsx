import { Button, Code, FileInput, Image, Stack, Text, Title } from '@mantine/core'
import { useGeolocation } from '@uidotdev/usehooks'
import { ref, uploadBytes } from 'firebase/storage'
import React, { useState } from 'react'
import { model, storage } from './Auth'

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
    if (!file) return

    setError(null)
    setLoading(true)

    try {
      const imageId = Date.now()
      const storageRef = ref(storage, String(imageId))
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type,
      })

      // Get the MIME type and Cloud Storage for Firebase URL.
      // toString() is the simplest way to construct the Cloud Storage for Firebase URL
      // in the required format.
      const mimeType = uploadResult.metadata.contentType
      const storageUrl = uploadResult.ref.toString()

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

      if (!mimeType) throw new Error('No MIME type')

      const imagePart = {
        fileData: {
          mimeType,
          fileUri: storageUrl,
        },
      }

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
