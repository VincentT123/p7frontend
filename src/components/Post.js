import { useContext, useState } from "react"
import { UserContext } from '../components/AppContext'
import axios from 'axios'

const Post = ({ post }) => {
  const user = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")

  const addComment = () => {

  }

  const edit = () => {

  }

  const remove = () => {
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
      .then(() => { })
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
    <li className="post" style={{ background: isEditing ? "#f3feff" : "white" }}>

      <div className="post-header">
        <h3>{post.user_name}</h3>
        <em>Posté le {dateFormat(post.date_cre)}</em>
      </div>

      {isEditing ? (
        <textarea
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
          {isEditing ? (
            <button onClick={() => edit()}>Valider</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          )}
          <button onClick={() => {
            if (window.confirm("Voulez-vous vraiment supprimer cet article ?")) {
              remove()
            }
          }}>Supprimer</button>

        </div>

      </div>

    </li>
  )
}

export default Post