import { useContext, useState } from "react"
import { UserContext } from '../components/AppContext'
import axios from 'axios'

const Post = ({ post, postsData, setPostsData }) => {
  const user = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  console.log("user.uid : ", user.uid, " - post.user_id : ", post.user_id)
  const isAuthor = (post.user_id === user.uid)
  console.log("isAuthor : ", isAuthor)


  const addComment = () => {

  }

  const editPost = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/posts/updatepost`
    const token = user.utoken
    const postId = post.id
    const text = editContent
    axios({
      method: 'put',
      url: url,
      headers: { 'authorization': token },
      data: {
        id: postId,
        texte: text
      }
      //withCredentials: true
    })
      .then(() => {
        setIsEditing(false)
        post.texte = editContent
      })
  }

  const removePost = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/posts/deletepost`
    const token = user.utoken
    const postId = post.id
    axios({
      method: 'delete',
      url: url,
      headers: { 'authorization': token },
      data: {
        id: postId
      }
      //withCredentials: true
    })
      .then(() => {
        //const postToDelete = document.getElementById(post.id)
        //postToDelete.remove() 
        console.log("postsData avant remove :", postsData)
        const tab = postsData.filter((item) => item.id !== post.id)
        console.log("postsData après remove :", postsData)
        setPostsData(tab)
      })
  }

  const dateFormat = (date) => {
    let newDate = new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    })
    return newDate
  }

  return (
    <li className="post" style={{ background: isEditing ? "#f3feff" : "white" }} id={post.id}>

      <div className="post-header">
        <h3>{post.user_name}</h3>
        <em>Posté le {dateFormat(post.date_cre)}</em>
      </div>

      {isEditing ? (
        <textarea
          spellCheck="false"
          defaultValue={editContent ? editContent : post.texte}
          autoFocus
          onChange={(e) => setEditContent(e.target.value)}>
        </textarea>
      ) : (
        <p>{editContent ? editContent : post.texte}</p>
      )}

      <div className="post-footer">

        <div className="post-likes">
          {post.likes}&nbsp;&nbsp;<i className="far fa-thumbs-up"></i> | &nbsp;&nbsp;
          {post.dislikes}&nbsp;&nbsp;<i className="far fa-thumbs-down"></i> | &nbsp;&nbsp;
          <button onClick={() => addComment()}>{post.comments}&nbsp;&nbsp;Commentaires</button>
        </div>

        <div className="post-maj-btn">
          {(isAuthor && isEditing) ? (
            <button onClick={() => editPost()}>Valider</button>
          ) : (isAuthor &&
            <button onClick={() => setIsEditing(true)}>Editer</button>
          )}
          {isAuthor &&
            <button onClick={() => removePost()}>Supprimer</button>
          }

        </div>

      </div>

    </li>
  )
}

export default Post