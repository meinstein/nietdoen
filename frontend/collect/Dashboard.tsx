import { Button, FileInput, Stack, Title } from '@mantine/core'
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
  const [file, setFile] = useState<File | null>(null)
  const state = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  })

  console.log(state)

  const onClick = async () => {
    const imagePart = await fileToGenerativePart(file)

    const prompt = 'What do you see?'

    // To generate text output, call generateContent with the text input
    const result = await model.generateContentStream([prompt, imagePart])

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      console.log(chunkText)
    }
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
      <Button onClick={onClick}>Generate</Button>
    </Stack>
  )
}
