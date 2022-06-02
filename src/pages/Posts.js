import { useContext } from 'react'
import { UserContext } from '../components/AppContext'

const Posts = () => {
  const user = useContext(UserContext)
  console.log("posts-id : ", user.uid)
  console.log("posts-token : ", user.utoken)

  return (
    <div className="posts-page">
      <div className="create-post">Ecrire un commentaire</div>
      <br />
      <ul>
        <li>post</li>
        <li>post</li>
        <li>post</li>
      </ul>
    </div>
  )
}

export default Posts