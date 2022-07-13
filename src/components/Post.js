import { useContext, useEffect, useRef, useState } from "react"
import { useMediaPredicate } from "react-media-hook"
import { UserContext } from '../components/AppContext'
import axios from 'axios'
import Comment from '../components/Comment'

const Post = ({ post, postsData, setPostsData, userLikes, setUserLikes, userDislikes, setUserDislikes }) => {
  const user = useContext(UserContext)
  // isEditing est un booléen permettant d'afficher ou pas le formulaire d'édition d'un post
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  // isReplying : booléen permettant d'afficher ou non le formulaire de création d'un commentaire
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [errorReply, setErrorReply] = useState(false)
  // isComments : booléen qui conditionne l'affichage de la liste des commentaires de réponse à un post 
  const [isComments, setIsComments] = useState(false)
  // commentsData mémorise la liste des commentaires obtenue avec la requête sur la table 'comments' de la base MySQL
  const [commentsData, setCommentsData] = useState([])
  // isAuthor : booléen qui détermine si l'utilisateur est l'auteur du post (ou l'admin) pour la modif/suppression
  const isAuthor = (post.user_id === user.uid || user.udroits === 1)
  // isLiked et isDisliked : booléen déterminant si le post a été liké/disliké par l'utilisateur
  const [isLiked, setIsLiked] = useState(userLikes.includes(post.id))
  const [isDisliked, setIsDisliked] = useState(userDislikes.includes(post.id))
  // userLikesC et userDislikesC mémorisent tous les likes et les dislikes de l'utilisateur obtenus avec
  // la requête sur la table 'comments_likes'
  const [userLikesC, setUserLikesC] = useState([])
  const [userDislikesC, setUserDislikesC] = useState([])
  // image (base) et imageFront (affichage) mémorise l'image éventuellement jointe au post par l'utilisateur
  // le useRef suivant permet d'utiliser un input de type file pour permettre à l'utilisateur de
  // joindre une image à son post tout en occultant cet input et en transférant le traitement sur une icône à cliquer
  const [image, setImage] = useState(null)
  const [imageFront, setImageFront] = useState(null)
  const hiddenImageInput = useRef(null)
  // même solution que ci-dessus, pour les commentaires cette fois
  const [imageC, setImageC] = useState(null)
  const [imageFrontC, setImageFrontC] = useState(null)
  const hiddenImageInputC = useRef(null)
  // définition des constantes de seuil pour l'affichage des boutons texte ou des boutons symbole
  // selon la taille de l'écran (grâce à la library react-media-hook)
  const largeScreen = useMediaPredicate("(min-width: 769px)")
  const smallScreen = useMediaPredicate("(max-width: 768px)")

  // fonction de traitement des likes :
  //   - un utilisateur ne peut pas voter pour lui-même
  //   - un like est enregistré avec une 'action' à 1 dans la table 'posts_likes', -1 pour un disl1ke
  //   - si l'utilisateur a déjà liké/disliké un post, le clic suivant sur l'incône correspondante annule
  //     son like/dislike, et action est mis à 0 pour le traitement par l'API
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

  // fonction permettant d'établir la liste des commentaires à afficher en réponse à un post
  const getComments = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/comments/listcomments`
    const token = user.utoken
    const postId = post.id
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
      })
      .catch((err) => console.log("erreur axios listcomments : ", err))
  }

  // fonction récupérant tous les likes/dislikes de l'utilisateur sur la liste des commentaires affichée
  const getLikesC = () => {
    // conditionner l'accès db avec isComments ?
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

  // lecture de la table 'comments' pour établir la liste des commentaires du post concerné ainsi que
  // tous les likes/dislikes de l'utilisateur sur ces commentaires
  // flag permet d'alterner l'affichage de la liste sur un clic et la disparition sur le clic suivant 
  const getCommentsData = (flag) => {
    if (isComments && flag === 0) {
      setIsComments(false)
      return
    }
    getComments()
    getLikesC()
  }

  // fonction gérant la mise à jour d'un post dans la base suite à un clic sur le bouton 'Valider'
  // les données doivent être formatées sous un formData pour permettre le traitement des img par l'API
  const editPost = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/posts/updatepost`
    const token = user.utoken
    const postId = post.id
    const text = (editContent ? editContent : post.texte)
    const supprImg = (post.url_media != null && imageFront === null)
    const obj = {
      id: postId,
      texte: text,
      supprImg
    }
    const json = JSON.stringify(obj)
    const formData = new FormData()
    formData.append("image", image)
    formData.append("message", json)
    axios({
      method: 'put',
      url: url,
      headers: {
        'authorization': token,
        "Content-Type": "multipart/form-data"
      },
      data: formData
    })
      .then((res) => {
        setIsEditing(false)
        if (editContent != "") {
          post.texte = editContent
          setEditContent("")
        }
        if (res.data.imageUrl != undefined) {
          post.url_media = res.data.imageUrl
          setImageFront(post.url_media)
        }
        if (supprImg) {
          post.url_media = null
          setImageFront(null)
        }
      })
  }

  // annule l'édition d'un post suite au clic sur le bouton 'Annuler'
  const cancelEdit = () => {
    setEditContent("")
    setIsEditing(false)
    setImageFront(post.url_media)
  }

  // supprime un commentaire de la table 'posts' suite au clic sur le bouton 'Supprimer'
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

  // création d'un commentaire dans la table 'comments' suite à un clic sur le bouton 'Envoyer'
  // les données doivent être formatées sous un formData pour permettre le traitement des img par l'API
  const createComment = (e) => {
    e.preventDefault()
    if (replyContent.length < 2 || replyContent.length > 2000) {
      setErrorReply(true)
    } else {
      const url = `${process.env.REACT_APP_API_URL}groupomania/comments/createcomment`
      const token = user.utoken
      const uname = user.uprenom + " " + user.unom
      const obj = {
        texte: replyContent,
        post_id: post.id,
        user_id: user.uid,
        user_name: uname
      }
      const json = JSON.stringify(obj)
      const formData = new FormData()
      formData.append("image", imageC)
      formData.append("message", json)

      axios({
        method: 'post',
        url: url,
        headers: {
          'authorization': token,
          "Content-Type": "multipart/form-data"
        },
        data: formData
      })
        .then((res) => {
          setIsReplying(false)
          setErrorReply(false)
          setReplyContent("")
          setImageC(null)
          setImageFrontC(null)
          getCommentsData(1)
          post.comments = post.comments + 1
        })
    }
  }

  // évite l'affichage de l'input de type file et permet d'utiliser un bouton custom (post)
  const handleImageClick = (e) => {
    hiddenImageInput.current.click()
  }

  // mémorise l'éventuelle image jointe au post par l'utilisateur
  const addImage = (e) => {
    setImageFront(URL.createObjectURL(e.target.files[0]))
    setImage(e.target.files[0])
  }

  // efface les données image mémorisées suite au clic sur l'icône 'supprimer l'image' d'un post
  const deleteImage = () => {
    setImage(null)
    setImageFront(null)
  }

  // évite l'affichage de l'input de type file et permet d'utiliser un bouton custom (commentaire)
  const handleImageClickC = (e) => {
    hiddenImageInputC.current.click()
  }

  // mémorise l'éventuelle image jointe au commentaire par l'utilisateur
  const addImageC = (e) => {
    setImageFrontC(URL.createObjectURL(e.target.files[0]))
    setImageC(e.target.files[0])
  }

  // efface les données image mémorisées suite au clic sur l'icône 'supprimer l'image' d'un commentaire
  const deleteImageC = () => {
    setImageC(null)
    setImageFrontC(null)
  }

  // fonction convertissant le timestamp fourni par la base en date au format "jour mois année à hh:mm:ss"
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

  // affiche l'image correspondante à l'adresse mémorisée dans la table 'post'
  useEffect(() => {
    setImageFront(post.url_media)
  }, [])

  return (
    <li className="post" style={{ background: isEditing ? "#f3feff" : "white" }} id={"post" + post.id}>

      <div className="post-header">
        <h3>{post.user_name}</h3>
        <em>Posté le {dateFormat(post.date_cre)}</em>
      </div>

      {(imageFront != null) ? <img className="post-image" src={imageFront} /> : <></>}

      {isEditing ? (
        <>
          <div className="btn-upload-delete">
            <i onClick={(e) => handleImageClick(e)} className="far fa-image addimage"><span className="tooltip-addimage">Ajouter une image</span></i>
            <input type="file"
              style={{ display: 'none' }}
              ref={hiddenImageInput}
              onChange={(e) => addImage(e)} />
            {imageFront != null ? <i onClick={(e) => deleteImage(e)} className="far fa-trash-alt deleteimage"><span className="tooltip-deleteimage">Supprimer l'image</span></i> : <span></span>}
          </div>
          <textarea
            spellCheck="false"
            value={editContent ? editContent : post.texte}
            autoFocus
            onChange={(e) => setEditContent(e.target.value)}>
          </textarea>
        </>
      ) : (
        <p className="post-content">{editContent ? editContent : post.texte}</p>)
      }

      <div className="post-footer">

        <div className="post-likes">
          {post.likes}&nbsp;&nbsp;<i onClick={() => likePost(1)} className={`${isLiked ? "fas liked " : "far "} fa-thumbs-up thumb-up`}></i> | &nbsp;&nbsp;
          {post.dislikes}&nbsp;&nbsp;<i onClick={() => likePost(-1)} className={`${isDisliked ? "fas disliked " : "far "} fa-thumbs-down thumb-down`}></i> | &nbsp;&nbsp;
          <button onClick={() => { getCommentsData(0) }}>{post.comments}&nbsp;&nbsp;Commentaires</button>
          <span onClick={() => { if (user.udroits === 0) setIsReplying(true) }} className="reply">Répondre</span>
        </div>

        <div className="post-maj-btn">
          {(isAuthor && isEditing) ? (
            <>
              {largeScreen &&
                <>
                  <button onClick={() => editPost()}>Valider</button>
                  <button onClick={() => cancelEdit()}>Annuler</button>
                </>}
              {smallScreen &&
                <>
                  <i onClick={() => editPost()} class="far fa-check-circle btn-small-screen"></i>
                  <i onClick={() => cancelEdit()} class="far fa-window-close btn-small-screen"></i>
                </>}
            </>
          ) : (isAuthor &&
            <>
              {largeScreen && <button onClick={() => setIsEditing(true)}>Editer</button>}
              {smallScreen && <i onClick={() => setIsEditing(true)} className="far fa-edit btn-small-screen"></i>}
            </>
          )}
          {isAuthor &&
            <>
              {largeScreen && <button onClick={() => removePost()} className="btn-remove-txt">Supprimer</button>}
              {smallScreen && <i onClick={() => removePost()} className="far fa-trash-alt btn-small-screen"></i>}
            </>
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
          {(imageFrontC != null) ? <img className="post-img-to-upload" src={imageFrontC} /> : <></>}
          <div className="btn-upload-delete">
            <i onClick={(e) => handleImageClickC(e)} className="far fa-image addimage"><span className="tooltip-addimage">Ajouter une image</span></i>
            <input type="file"
              style={{ display: 'none' }}
              ref={hiddenImageInputC}
              onChange={(e) => addImageC(e)} />
            {imageFrontC != null ? <i onClick={(e) => deleteImageC(e)} className="far fa-trash-alt deleteimage"><span className="tooltip-deleteimage">Supprimer l'image</span></i> : <span></span>}
          </div>
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
              setImageC(null)
              setImageFrontC(null)
            }}>Annuler</button>
          </div>
        </form>
      }

    </li>
  )
}

export default Post