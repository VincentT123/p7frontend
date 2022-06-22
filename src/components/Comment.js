import { useContext, useState } from "react"
import { UserContext } from '../components/AppContext'
import axios from 'axios'

const Comment = ({ comment, commentsData, setCommentsData, userLikesC, setUserLikesC, userDislikesC, setUserDislikesC, isReplying, setIsReplying, postsData, setPostsData }) => {
  const user = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const isAuthor = (comment.user_id === user.uid)
  //const [isLiked, setIsLiked] = useState(userLikes.includes(comment.id))
  //const [isDisliked, setIsDisliked] = useState(userDislikes.includes(comment.id))
  // temp : -> passer les likes/dislikes dans le contexte user
  //const [userLikes, setUserLikes] = useState([])
  //const [userDislikes, setUserDislikes] = useState([])
  console.log("comment id : ", comment.id)
  console.log("userLikesC : ", userLikesC)
  const [isLiked, setIsLiked] = useState(userLikesC.includes(comment.id))
  const [isDisliked, setIsDisliked] = useState(userDislikesC.includes(comment.id))
  console.log("isLiked : ", isLiked)

  const likeComment = (act) => {
    if (comment.user_id === user.uid) {
      alert("Vous ne pouvez pas voter pour votre propre commentaire")
      return
    }
    let action = act
    if ((isLiked && act === 1) || (isDisliked && act === -1)) { action = 0 }
    const url = `${process.env.REACT_APP_API_URL}groupomania/comments/like`
    const token = user.utoken
    const commentId = comment.id
    const userId = user.uid
    axios({
      method: 'post',
      url: url,
      headers: { 'authorization': token },
      data: {
        cid: commentId,
        uid: userId,
        act: action
      }
    })
      .then(() => {
        const tabLikes = userLikesC
        const tabDislikes = userDislikesC
        switch (act) {
          case 1:
            if (isLiked) {
              comment.likes = comment.likes - 1
              setUserLikesC(tabLikes.filter(item => item !== comment.id))
              setIsLiked(false)
            } else {
              comment.likes = comment.likes + 1
              tabLikes.push(comment.id)
              setUserLikesC(tabLikes)
              setIsLiked(true)
              if (isDisliked) {
                comment.dislikes = comment.dislikes - 1
                setUserDislikesC(tabDislikes.filter(item => item !== comment.id))
                setIsDisliked(false)
              }
            }
            break
          case -1:
            if (isDisliked) {
              comment.dislikes = comment.dislikes - 1
              setUserDislikesC(tabDislikes.filter(item => item !== comment.id))
              setIsDisliked(false)
            } else {
              comment.dislikes = comment.dislikes + 1
              tabDislikes.push(comment.id)
              setUserDislikesC(tabDislikes)
              setIsDisliked(true)
              if (isLiked) {
                comment.likes = comment.likes - 1
                setUserLikesC(tabLikes.filter(item => item !== comment.id))
                setIsLiked(false)
              }
            }
            break
          default:
            console.log("wrong act value")
        }
      })
  }

  const editComment = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/comments/updatecomment`
    const token = user.utoken
    const commentId = comment.id
    const text = editContent
    axios({
      method: 'put',
      url: url,
      headers: { 'authorization': token },
      data: {
        id: commentId,
        texte: text
      }
    })
      .then(() => {
        setIsEditing(false)
        comment.texte = editContent
      })
  }

  const removeComment = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/comments/deletecomment`
    const token = user.utoken
    const commentId = comment.id
    const postId = comment.post_id
    axios({
      method: 'delete',
      url: url,
      headers: { 'authorization': token },
      data: {
        id: commentId,
        post_id: postId
      }
    })
      .then(() => {
        const tabComments = commentsData.filter((item) => item.id !== comment.id)
        setCommentsData(tabComments)
        let tabPosts = postsData
        tabPosts.map((item) => {
          if (item.id === comment.post_id) {
            item.comments = item.comments - 1
          }
        })
        setPostsData(tabPosts)
      })
  }

  const reply = () => {
    setIsReplying(true)
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
    <li className="comment" style={{ background: isEditing ? "#f3feff" : "white" }} id={comment.id}>

      <div className="comment-header">
        <h3>{comment.user_name}</h3>
        <em>Posté le {dateFormat(comment.date_cre)}</em>
      </div>

      {isEditing ? (
        <textarea
          spellCheck="false"
          value={editContent ? editContent : comment.texte}
          autoFocus
          onChange={(e) => setEditContent(e.target.value)}>
        </textarea>
      ) : (
        <p className="comment-content">{editContent ? editContent : comment.texte}</p>
      )}

      <div className="comment-footer">

        <div className="comment-likes">
          {comment.likes}&nbsp;&nbsp;<i onClick={() => likeComment(1)} className={`${isLiked ? "fas liked " : "far "} fa-thumbs-up thumb-up`}></i> | &nbsp;&nbsp;
          {comment.dislikes}&nbsp;&nbsp;<i onClick={() => likeComment(-1)} className={`${isDisliked ? "fas disliked " : "far "} fa-thumbs-down thumb-down`}></i> | &nbsp;&nbsp;
          <span onClick={reply} className="reply">Répondre</span>
        </div>

        <div className="comment-maj-btn">
          {(isAuthor && isEditing) ? (
            <>
              <button onClick={() => editComment()}>Valider</button>
              <button onClick={() => {
                setEditContent("")
                setIsEditing(false)
              }}>Annuler</button>
            </>
          ) : (isAuthor &&
            <button onClick={() => setIsEditing(true)}>Editer</button>
          )}
          {isAuthor &&
            <button onClick={() => removeComment()}>Supprimer</button>
          }

        </div>

      </div>

    </li>
  )
}

export default Comment