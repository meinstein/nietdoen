import {
  Autocomplete,
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
import { useForm } from '@mantine/form'

type AIResponse = Record<Field, string | string[]>

const convertNaToNull = (value: string) => (value === 'n/a' ? null : value)

export const Dashboard = () => {
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      casing: '',
      colors: [],
      condition: '',
      design: '',
      location: '',
      material: '',
      sentiment: '',
      shape: '',
      symbols: [],
      text: '',
      tone: '',
    },
    validate: {
      // casing, text, and tone are optional
      colors: value => {
        if (value.length === 0) return 'Please select at least one color'
      },
      condition: value => {
        if (!value) return 'Please select a condition'
      },
      design: value => {
        if (!value) return 'Please select a design'
      },
      location: value => {
        if (!value) return 'Please select a location'
      },
      material: value => {
        if (!value) return 'Please select a material'
      },
      sentiment: value => {
        if (!value) return 'Please select a sentiment'
      },
      shape: value => {
        if (!value) return 'Please select a shape'
      },
      symbols: value => {
        if (value.length === 0) return 'Please select at least one symbol'
      },
    }
  })

  const [response, setResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<string>('dutch')
  const [file, setFile] = useState<File | null>(null)
  const [storageUrls, setStorageUrls] = useState<{ sm: string; lg: string } | null>(null)

  const geo = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  })

  useEffect(() => {
    if (!file) {
      form.reset()
      setResponse(null)
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
      const resData = JSON.parse(response.text())
      form.setValues(resData)
      setResponse(resData)
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const onSubmit = async () => {
    if (form.validate().hasErrors) {
      return
    }

    if (!storageUrls || !geo.latitude || !geo.longitude) return
    setLoading(true)

    const values = form.getValues()

    const data = {
      language,
      symbols: values.symbols,
      condition: values.condition,
      location: values.location,
      sentiment: values.sentiment,
      material: values.material,
      colors: values.colors,
      text: convertNaToNull(values.text),
      casing: convertNaToNull(values.casing),
      design: values.design,
      tone: convertNaToNull(values.tone),
      shape: values.shape,
      storage_urls: storageUrls,
      created_at: new Timestamp(Date.now() / 1000, 0),
      coordinates: new GeoPoint(geo.latitude, geo.longitude),
    }

    await addDoc(collection(db, 'signs'), data)
    form.reset()
    setResponse(null)
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
      {response && (
        <>
          <Textarea label='Text' key={form.key('text')} {...form.getInputProps('text')} />
          <Group>
            <Select
              flex={1}
              label='Casing'
              data={Options.CASING}
              key={form.key('casing')}
              {...form.getInputProps('casing')}
            />
            <Select
              flex={1}
              label='design'
              data={Options.DESIGN}
              key={form.key('design')}
              {...form.getInputProps('design')}
            />
          </Group>
          <Group>
            <Select
              flex={1}
              label='Condition'
              data={Options.CONDITION}
              key={form.key('condition')}
              {...form.getInputProps('condition')}
            />
            <Autocomplete
              flex={1}
              label='Location'
              data={Options.LOCATION}
              key={form.key('location')}
              {...form.getInputProps('location')}
            />
          </Group>
          <Group>
            <Select
              flex={1}
              label='Sentiment'
              data={Options.SENTIMENT}
              key={form.key('sentiment')}
              {...form.getInputProps('sentiment')}
            />
            <Select
              flex={1}
              label='Tone'
              data={Options.TONE}
              key={form.key('tone')}
              {...form.getInputProps('tone')}
            />
          </Group>
          <Group>
            <Autocomplete
              flex={1}
              label='Shape'
              data={Options.SHAPE}
              key={form.key('shape')}
              {...form.getInputProps('shape')}
            />
            <Autocomplete
              flex={1}
              label='Material'
              data={Options.MATERIAL}
              key={form.key('material')}
              {...form.getInputProps('material')}
            />
          </Group>
          <TagsInput label='Colors' key={form.key('colors')} {...form.getInputProps('colors')} />
          <TagsInput label='Symbols' key={form.key('symbols')} {...form.getInputProps('symbols')} />
        </>
      )}

      {error && <Text c='red'>{error}</Text>}
      {file && !response && (
        <Button loading={loading} onClick={onAnalyze}>
          Analyze
        </Button>
      )}
      {file && response && (
        <Button loading={loading} onClick={onSubmit}>
          Submit
        </Button>
      )}
    </Stack>
  )
}
