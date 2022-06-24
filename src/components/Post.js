import { useContext, useEffect, useState } from "react"
import { UserContext } from '../components/AppContext'
import axios from 'axios'
import Comment from '../components/Comment'

const Post = ({ post, postsData, setPostsData, userLikes, setUserLikes, userDislikes, setUserDislikes }) => {
  const user = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [errorReply, setErrorReply] = useState(false)
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
      })
  }

  const getComments = (flag) => {
    /*if (isComments && flag === 0) {
      setIsComments(false)
      return
    }*/
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
        setCommentsData(res.data.results)
        //setIsComments(true)
      })
      .catch((err) => console.log("erreur axios listcomments : ", err))
  }

  const getLikesC = () => {
    // conditionner l'accès db avec isComments
    const url = `${process.env.REACT_APP_API_URL}groupomania/comments/userlikes`
    const token = user.utoken
    axios({
      method: 'post',
      url: url,
      headers: { 'authorization': token },
      data: { id: user.uid }
    })
      .then((res) => {
        setUserLikesC(Array.from(res.data.results.filter(item => item.action === 1), item => item.comment_id))
        setUserDislikesC(Array.from(res.data.results.filter(item => item.action === -1), item => item.comment_id))
        setIsComments(true)
      })
      .catch((err) => console.log("erreur axios userlikes comments : ", err))
  }

  /*useEffect(() => getComments(), [])
  useEffect(() => getLikesC(), [])*/
  const getCommentsData = (flag) => {
    if (isComments && flag === 0) {
      setIsComments(false)
      return
    }
    getComments()
    getLikesC()
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
    })
      .then(() => {
        const tab = postsData.filter((item) => item.id !== post.id)
        setPostsData(tab)
      })
  }

  const createComment = (e) => {
    e.preventDefault()
    if (replyContent.length > 2000) {
      setErrorReply(true)
    } else {
      const url = `${process.env.REACT_APP_API_URL}groupomania/comments/createcomment`
      const token = user.utoken
      const uname = user.uprenom + " " + user.unom
      axios({
        method: 'post',
        url: url,
        headers: { 'authorization': token },
        data: {
          texte: replyContent,
          post_id: post.id,
          user_id: user.uid,
          user_name: uname
        }
      })
        .then((res) => {
          setIsReplying(false)
          setErrorReply(false)
          setReplyContent("")
          post.comments = post.comments + 1
          /*getComments(1)
          getLikesC()*/
          getCommentsData(1)
        })
    }
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

      {post.url_media != null ? <img className="post-image" src={post.url_media} /> : <></>}

      {isEditing ? (
        <textarea
          spellCheck="false"
          value={editContent ? editContent : post.texte}
          autoFocus
          onChange={(e) => setEditContent(e.target.value)}>
        </textarea>
      ) : (
        <p className="post-content">{editContent ? editContent : post.texte}</p>
      )}

      <div className="post-footer">

        <div className="post-likes">
          {post.likes}&nbsp;&nbsp;<i onClick={() => likePost(1)} className={`${isLiked ? "fas liked " : "far "} fa-thumbs-up thumb-up`}></i> | &nbsp;&nbsp;
          {post.dislikes}&nbsp;&nbsp;<i onClick={() => likePost(-1)} className={`${isDisliked ? "fas disliked " : "far "} fa-thumbs-down thumb-down`}></i> | &nbsp;&nbsp;
          <button onClick={() => { getCommentsData(0) }}>{post.comments}&nbsp;&nbsp;Commentaires</button>
          <span onClick={() => setIsReplying(true)} className="reply">Répondre</span>
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

      {isComments &&
        <ul>
          {commentsData
            .sort((a, b) => b.date_cre - a.date_cre)
            .map((comment) => (
              <Comment key={comment.id} comment={comment} commentsData={commentsData} setCommentsData={setCommentsData}
                userLikesC={userLikesC} setUserLikesC={setUserLikesC}
                userDislikesC={userDislikesC} setUserDislikesC={setUserDislikesC}
                isReplying={isReplying} setIsReplying={setIsReplying}
                postsData={postsData} setPostsData={setPostsData} />
            ))}
        </ul>
      }

      {isReplying &&
        <form action="" onSubmit={(e) => createComment(e)} id="form-create-comment">
          <textarea
            spellCheck="false"
            style={{ border: errorReply ? "1px solid red" : "1px solid #61dafb" }}
            placeholder="Message"
            onChange={(e) => setReplyContent(e.target.value)}
            value={replyContent}>
          </textarea>
          {errorReply && <p>Veuillez ne pas dépasser 2000 caractères</p>}
          <div className="create-post-footer">
            <input type="submit" value="Envoyer" className="create-post-submit" />
            <button type="button" className="create-post-cancel" onClick={() => {
              setIsReplying(false)
              setReplyContent("")
            }}>Annuler</button>
          </div>
        </form>
      }

    </li>
  )
}

export default Post