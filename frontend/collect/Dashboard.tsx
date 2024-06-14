import { Button, Code, FileInput, Stack, Text, Title } from '@mantine/core'
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
  const [res, setRes] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const state = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  })

  console.log(state)

  const onClick = async () => {
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

    console.log(JSON.parse(response.text()))
    setRes(response.text())
  }

  return (
    <Stack p='lg'>
      <Title order={3}>Upload</Title>
      <FileInput
        clearable
        placeholder='Upload image'
        label='Upload image'
        value={file}
        onChange={setFile}
        capture='environment'
        accept='image/*'
      />
      <Button loading={false} onClick={onClick}>
        Generate
      </Button>
      <Text>Lat: {state.latitude}</Text>
      <Text>Long: {state.longitude}</Text>
      <Code>{res}</Code>
    </Stack>
  )
}
