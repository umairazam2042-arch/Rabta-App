import React from 'react'
import { useParams } from 'react-router'
import ProfileView from '../components/profile/ProfileView'

const ProfilePage = () => {
  const { username } = useParams() // URL se username milta hai

  // key: username badalte hi ProfileView naya ban jata hai (purani information saaf)
  return <ProfileView key={username} username={username} />
}

export default ProfilePage