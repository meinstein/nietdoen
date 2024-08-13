import {
  Button,
  FileInput,
  Group,
  Image,
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
import { Field, KEYS, Options, response_fields } from './responseFields'
import { dayjs } from './utils'

type AIResponse = Record<Field, string | string[]>

export const Dashboard = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<string>('dutch')
  const [res, setRes] = useState<AIResponse | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [storageUrls, setStorageUrls] = useState<{ sm: string; lg: string } | null>(null)
  const geo = useGeolocation({
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
    if (!res || !storageUrls || !geo.latitude || !geo.longitude) return
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
      casing: res.casing,
      design: res.design,
      tone: res.tone,
      shape: res.shape,
      storage_urls: storageUrls,
      created_at: new Timestamp(Date.now() / 1000, 0),
      coordinates: new GeoPoint(geo.latitude, geo.longitude),
    }

    await addDoc(collection(db, 'signs'), data)
    setRes(null)
    setFile(null)
    setLoading(false)
  }

  const geoLastUpdated = dayjs(geo.timestamp).fromNow()

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
      <Group>
        <Select
          flex={1}
          data={['dutch', 'english']}
          label='Language'
          value={language}
          onChange={lang => {
            setLanguage(lang as string)
          }}
        />
        <TextInput
          flex={2}
          disabled
          label={`Coordinates (${geo.loading ? '' : geoLastUpdated})`}
          value={geo.loading ? 'Loading...' : `${geo.latitude}, ${geo.longitude}`}
        />
      </Group>
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
        {res?.casing && (
          <Select
            flex={1}
            label='Casing'
            data={Options.CASING}
            defaultValue={res.casing as string}
          />
        )}
        {res?.design && (
          <Select
            flex={1}
            label='design'
            data={Options.DESIGN}
            defaultValue={res.design as string}
          />
        )}
      </Group>
      <Group>
        {res?.condition && (
          <Select
            flex={1}
            label='Condition'
            data={Options.CONDITION}
            defaultValue={res.condition as string}
          />
        )}
        {res?.location && (
          <Select
            flex={1}
            label='Location'
            data={Options.LOCATION}
            defaultValue={res.location as string}
          />
        )}
      </Group>
      <Group>
        {res?.sentiment && (
          <Select
            flex={1}
            label='Sentiment'
            data={Options.SENTIMENT}
            defaultValue={res.sentiment as string}
          />
        )}
        {res?.tone && (
          <Select flex={1} label='Tone' data={Options.TONE} defaultValue={res.tone as string} />
        )}
      </Group>
      <Group>
        {res?.shape && (
          <Select flex={1} label='Shape' data={Options.SHAPE} defaultValue={res.shape as string} />
        )}
        {res?.material && (
          <Select
            flex={1}
            label='Material'
            data={Options.MATERIAL}
            defaultValue={res.material as string}
          />
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
