import { Group, Loader } from '@mantine/core'
import React from 'react'
import { Auth, useAuth } from './Auth'
import { Dashboard } from './Dashboard'

export const App = () => {
  const { isLoading, currentUser } = useAuth()

  if (isLoading) {
    return (
      <Group p='lg' m='lg' justify='center'>
        <Loader />
      </Group>
    )
  }

  if (currentUser) {
    return <Dashboard />
  }

  return <Auth />
}
