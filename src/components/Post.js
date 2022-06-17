import { useContext, useState } from "react"
import { UserContext } from '../components/AppContext'
import axios from 'axios'
import Comment from '../components/Comment'

const Post = ({ post, postsData, setPostsData, userLikes, setUserLikes, userDislikes, setUserDislikes }) => {
  const user = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [isComments, setIsComments] = useState(false)
  const [commentsData, setCommentsData] = useState([])
  const isAuthor = (post.user_id === user.uid)
  const [isLiked, setIsLiked] = useState(userLikes.includes(post.id))
  const [isDisliked, setIsDisliked] = useState(userDislikes.includes(post.id))
  // likes à passer dans le contexte ?
  const [userLikesC, setUserLikesC] = useState([])
  const [userDislikesC, setUserDislikesC] = useState([])

  const likePost = (act) => {
    if (post.user_id === user.uid) {
      alert("Vous ne pouvez pas voter pour votre propre commentaire")
      return
    }
    let action = act
    if ((isLiked && act === 1) || (isDisliked && act === -1)) { action = 0 }
    const url = `${process.env.REACT_APP_API_URL}groupomania/posts/like`
    const token = user.utoken
    const postId = post.id
    const userId = user.uid
    console.log("front action : ", action)
    axios({
      method: 'post',
      url: url,
      headers: { 'authorization': token },
      data: {
        pid: postId,
        uid: userId,
        act: action
      }
    })
      .then(() => {
        console.log("retour like")
        const tabLikes = userLikes
        const tabDislikes = userDislikes
        switch (act) {
          case 1:
            if (isLiked) {
              post.likes = post.likes - 1
              setUserLikes(tabLikes.filter(item => item !== post.id))
              setIsLiked(false)
            } else {
              post.likes = post.likes + 1
              tabLikes.push(post.id)
              setUserLikes(tabLikes)
              setIsLiked(true)
              if (isDisliked) {
                post.dislikes = post.dislikes - 1
                setUserDislikes(tabDislikes.filter(item => item !== post.id))
                setIsDisliked(false)
              }
            }
            break
          case -1:
            if (isDisliked) {
              post.dislikes = post.dislikes - 1
              setUserDislikes(tabDislikes.filter(item => item !== post.id))
              setIsDisliked(false)
            } else {
              post.dislikes = post.dislikes + 1
              tabDislikes.push(post.id)
              setUserDislikes(tabDislikes)
              setIsDisliked(true)
              if (isLiked) {
                post.likes = post.likes - 1
                setUserLikes(tabLikes.filter(item => item !== post.id))
                setIsLiked(false)
              }
            }
            break
          default:
            console.log("wrong act value")
        }
        console.log("retour userLikes : ", userLikes)
        console.log("retour isLiked : ", isLiked)
      })
  }

  const getComments = () => {
    console.log("isComments avant if : ", isComments)
    if (isComments) {
      setIsComments(false)
      console.log("isComments dans if : ", isComments)
      return
    }
    const url = `${process.env.REACT_APP_API_URL}groupomania/comments/listcomments`
    const token = user.utoken
    const postId = post.id
    console.log("post_id : ", postId)
    axios({
      method: 'post',
      url: url,
      headers: { 'authorization': token },
      data: {
        post_id: postId
      }
    })
      .then((res) => {

        console.log("data results : ", res.data.results)
        setCommentsData(res.data.results)
        setIsComments(true)
        console.log("commentsData : ", commentsData)
        console.log("isComments : ", isComments)
        //e.preventDefault()
      })
      .catch((err) => console.log("erreur axios listcomments : ", err))
  }

  const getLikesC = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/comments/userlikes`
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
        setUserLikesC(Array.from(res.data.results.filter(item => item.action === 1), item => item.comment_id))
        setUserDislikesC(Array.from(res.data.results.filter(item => item.action === -1), item => item.comment_id))
      })
      .catch((err) => console.log("erreur axios userlikes comments : ", err))
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
        const tab = postsData.filter((item) => item.id !== post.id)
        setPostsData(tab)
      })
  }

  const reply = () => {

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
          value={editContent ? editContent : post.texte}
          autoFocus
          onChange={(e) => setEditContent(e.target.value)}>
        </textarea>
      ) : (
        <p>{editContent ? editContent : post.texte}</p>
      )}

      <div className="post-footer">

        <div className="post-likes">
          {post.likes}&nbsp;&nbsp;<i onClick={() => likePost(1)} className={`${isLiked ? "fas liked " : "far "} fa-thumbs-up thumb-up`}></i> | &nbsp;&nbsp;
          {post.dislikes}&nbsp;&nbsp;<i onClick={() => likePost(-1)} className={`${isDisliked ? "fas disliked " : "far "} fa-thumbs-down thumb-down`}></i> | &nbsp;&nbsp;
          <button onClick={() => { getComments(); getLikesC() }}>{post.comments}&nbsp;&nbsp;Commentaires</button>
          <span onClick={reply} className="reply">Répondre</span>

          {isComments &&
            <ul>
              {commentsData
                .sort((a, b) => b.date_cre - a.date_cre)
                .map((comment) => (
                  <Comment key={comment.id} comment={comment} commentsData={commentsData} setCommentsData={setCommentsData}
                    userLikesC={userLikesC} setUserLikesC={setUserLikesC}
                    userDislikesC={userDislikesC} setUserDislikesC={setUserDislikesC} />
                ))}
            </ul>
          }

        </div>

        <div className="post-maj-btn">
          {(isAuthor && isEditing) ? (
            <>
              <button onClick={() => editPost()}>Valider</button>
              <button onClick={() => {
                setEditContent("")
                setIsEditing(false)
              }}>Annuler</button>
            </>
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