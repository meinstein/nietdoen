import { Button, PasswordInput, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { initializeApp } from 'firebase/app'
import { ReCaptchaEnterpriseProvider, initializeAppCheck } from 'firebase/app-check'
import { User, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getGenerativeModel, getVertexAI } from 'firebase/vertexai-preview'
import React, { useEffect } from 'react'
import { Config } from '../config'

const firebaseConfig = {
  apiKey: 'AIzaSyCxU0t-ZE5snXRwUQwMYVJ8iqXRGMzzp6k',
  authDomain: 'nietdoen.firebaseapp.com',
  projectId: 'nietdoen',
  storageBucket: 'nietdoen.appspot.com',
  messagingSenderId: '1070935575790',
  appId: '1:1070935575790:web:359a8a6054407995eff7ff',
}

const app = initializeApp(firebaseConfig)



// @ts-expect-error - This is a debug token and should not be used in production
self.FIREBASE_APPCHECK_DEBUG_TOKEN = Boolean(Config.NODE_ENV === 'development')

initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(Config.RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
})

console.log(Config)

const auth = getAuth(app)
const vertexAI = getVertexAI(app)
export const db = getFirestore(app)
export const model = getGenerativeModel(vertexAI, {
  model: 'gemini-1.5-flash',
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
