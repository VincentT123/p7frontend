import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../components/AppContext'
import axios from 'axios'
import Post from '../components/Post'

const Posts = () => {
  const user = useContext(UserContext)
  const [postsData, setPostsData] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [content, setContent] = useState("")
  const [error, setError] = useState(false)

  const refresh = () => {

  }

  const createPost = (e) => {
    e.preventDefault()
    if (content.length > 2000) {
      setError(true)
    } else {
      const url = `${process.env.REACT_APP_API_URL}groupomania/posts/createpost`
      const token = user.utoken
      const uname = user.uprenom + " " + user.unom
      axios({
        method: 'post',
        url: url,
        headers: { 'authorization': token },
        data: {
          date_cre: "2022-06-03 15:02:33",
          texte: content,
          user_id: user.uid,
          user_name: uname
        }
        //withCredentials: true
      })
        .then(() => {
          setIsCreating(false)
          setError(false)
          setContent("")
          getData()
        })
    }
  }

  const getData = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/posts/listposts`
    const token = user.utoken
    axios({
      method: 'get',
      url: url,
      headers: { 'authorization': token }
      //withCredentials: true
    })
      .then((res) => {
        console.log("res.data.results : ", res.data.results)
        setPostsData(res.data.results)
        console.log("postsData : ", postsData)
      })
      .catch((err) => console.log("erreur axios listsposts : ", err))
  }

  useEffect(() => getData(), [])

  return (
    <div className="posts-page">
      <div className="posts-page-header">
        <button type="button" onClick={() => setIsCreating(true)} className="btn-create-post">ECRIRE UN COMMENTAIRE</button>
        <button type="button" onClick={refresh} className="btn-refresh">ACTUALISER</button>
      </div>
      <br />
      {isCreating &&
        <form action="" onSubmit={(e) => createPost(e)}>
          <textarea
            spellcheck="false"
            style={{ border: error ? "1px solid red" : "1px solid #61dafb" }}
            placeholder="Message"
            onChange={(e) => setContent(e.target.value)}
            value={content}>
          </textarea>
          {error && <p>Veuillez ne pas dépasser 2000 caractères</p>}
          <input type="submit" value="Envoyer" />
        </form>
      }
      <br />
      <ul>
        {postsData
          .sort((a, b) => b.date_cre - a.date_cre)
          .map((post) => (
            <Post key={post.id} post={post} />
          ))}
      </ul>
    </div>
  )
}

export default Posts
