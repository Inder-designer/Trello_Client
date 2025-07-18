import { useVerifyInviteLinkMutation } from '@/redux/api/Board'
import { saveInviteToken } from '@/utils/inviteToken'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const VerifyInviteToken = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const token = new URLSearchParams(window.location.search).get('invite-token')
  console.log({ token: token });

  const [verifyToken] = useVerifyInviteLinkMutation()

  useEffect(() => {
    if (id && token) {
      saveInviteToken(id, token, true);
      verifyToken({ token: token })
        .unwrap()
        .then((response) => {
          console.log(res);
          
          if (response.isMember) {
            navigate(`/board/${id}`)
          } else {
            navigate(`/invite/accept-board`, {
              state: {
                board: response,
                verified: true,
              },
            });
          }
        })
        .catch((error) => {
          console.error('Error verifying invite token:', error)
          navigate(`/invite/accept-board`)
        })
    }
  }, [id, token, verifyToken])
  return (
    <></>
  )
}

export default VerifyInviteToken