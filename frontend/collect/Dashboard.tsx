import { Button, FileInput, Stack, Title } from '@mantine/core'
import { useGeolocation } from '@uidotdev/usehooks'
import { addDoc, collection } from 'firebase/firestore'
import React, { useState } from 'react'
import { db, model } from './Auth'

export const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null)
  const state = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  })

  console.log(state)

  const onClick = async () => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        first: 'Ada',
        last: 'Lovelace',
        born: 1815,
      })
      console.log('Document written with ID: ', docRef.id)
    } catch (e) {
      console.error('Error adding document: ', e)
    }

    // Provide a prompt that contains text
    const prompt = 'Write a story about a magic backpack.'

    // To generate text output, call generateContent with the text input
    const result = await model.generateContent(prompt)

    const response = result.response
    const text = response.text()
    console.log(text)
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
