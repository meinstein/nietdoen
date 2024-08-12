import { Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { initializeApp } from 'firebase/app'
import { ReCaptchaEnterpriseProvider, initializeAppCheck } from 'firebase/app-check'
import { User, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import {
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory,
  getGenerativeModel,
  getVertexAI,
} from 'firebase/vertexai-preview'
import React, { useEffect } from 'react'
import { Config } from '../config'

const firebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  appId: Config.FIREBASE_APP_ID,
  measurementId: Config.FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

if (Config.FIREBASE_APPCHECK_DEBUG_TOKEN) {
  // @ts-expect-error - This is a debug token and should not be used in production
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = Config.FIREBASE_APPCHECK_DEBUG_TOKEN
}

initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(Config.RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
})

const auth = getAuth(app)

const vertexAI = getVertexAI(app)

export const db = getFirestore(app)

export const storage = getStorage(app)

export const model = getGenerativeModel(vertexAI, {
  model: 'gemini-1.5-flash',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      method: HarmBlockMethod.HARM_BLOCK_METHOD_UNSPECIFIED,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      method: HarmBlockMethod.HARM_BLOCK_METHOD_UNSPECIFIED,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      method: HarmBlockMethod.HARM_BLOCK_METHOD_UNSPECIFIED,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      method: HarmBlockMethod.HARM_BLOCK_METHOD_UNSPECIFIED,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      method: HarmBlockMethod.HARM_BLOCK_METHOD_UNSPECIFIED,
    },
  ],
  generationConfig: {
    responseMimeType: 'application/json',
  },
})

export const useAuth = () => {
  const [user, setUser] = React.useState<User | null | undefined>()

  const signIn = async (props: { email: string; password: string }) => {
    try {
      await signInWithEmailAndPassword(auth, props.email, props.password)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    return onAuthStateChanged(auth, nextUser => {
      setUser(nextUser)
    })
  }, [])

  return {
    signIn,
    isLoading: user === undefined,
    currentUser: user,
  }
}

export const Auth = () => {
  const { signIn } = useAuth()

  const form = useForm({
    initialValues: {
      email: 'maximillianeinstein@gmail.com',
      password: '',
    },
  })

  return (
    <Stack p='lg'>
      <TextInput {...form.getInputProps('email')} label='Email' placeholder='Email' type='email' />
      <PasswordInput {...form.getInputProps('password')} label='Password' placeholder='Password' />
      <Button
        onClick={async () => {
          await signIn({
            email: form.values.email,
            password: form.values.password,
          })
          form.reset()
        }}
      >
        Sign in
      </Button>
    </Stack>
  )
}
