import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../components/AppContext'
import axios from 'axios'
import Post from '../components/Post'

const Posts = () => {
  const user = useContext(UserContext)
  const [postsData, setPostsData] = useState([])
  const [userLikes, setUserLikes] = useState([])
  const [userDislikes, setUserDislikes] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [content, setContent] = useState("")
  const [error, setError] = useState(false)

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
        setPostsData(res.data.results)
      })
      .catch((err) => console.log("erreur axios listposts : ", err))
  }

  const getLikes = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/posts/userlikes`
    const token = user.utoken
    console.log("id : ", user.uid)
    axios({
      method: 'post',
      url: url,
      headers: { 'authorization': token },
      data: { id: user.uid }
      //withCredentials: true
    })
      .then((res) => {
        setUserLikes(Array.from(res.data.results.filter(item => item.action === 1), item => item.post_id))
        setUserDislikes(Array.from(res.data.results.filter(item => item.action === -1), item => item.post_id))
      })
      .catch((err) => console.log("erreur axios userlikes : ", err))
  }

  useEffect(() => getData(), [])
  useEffect(() => getLikes(), [])

  return (
    <div className="posts-page">
      <div className="posts-page-header">
        <button type="button" onClick={() => setIsCreating(true)} className="btn-create-post">ECRIRE UN COMMENTAIRE</button>
        <button type="button" onClick={() => { getData(); getLikes() }} className="btn-refresh">ACTUALISER</button>
      </div>
      <br />
      {isCreating &&
        <form action="" onSubmit={(e) => createPost(e)} id="form-create-post">
          <textarea
            spellCheck="false"
            style={{ border: error ? "1px solid red" : "1px solid #61dafb" }}
            placeholder="Message"
            onChange={(e) => setContent(e.target.value)}
            value={content}>
          </textarea>
          {error && <p>Veuillez ne pas dépasser 2000 caractères</p>}
          <div className="create-post-footer">
            <input type="submit" value="Envoyer" className="create-post-submit" />
            <button type="button" className="create-post-cancel" onClick={() => {
              setIsCreating(false)
              setContent("")
            }}>Annuler</button>
          </div>
        </form>
      }
      <br />
      <ul>
        {postsData
          .sort((a, b) => b.date_cre - a.date_cre)
          .map((post) => (
            <Post key={post.id} post={post} postsData={postsData} setPostsData={setPostsData}
              userLikes={userLikes} setUserLikes={setUserLikes}
              userDislikes={userDislikes} setUserDislikes={setUserDislikes} />
          ))}
      </ul>
    </div>
  )
}

export default Posts
