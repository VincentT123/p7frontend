import { useContext, useEffect, useRef, useState } from "react"
import { UserContext } from '../components/AppContext'
import axios from 'axios'

const Comment = ({ comment, commentsData, setCommentsData, userLikesC, setUserLikesC, userDislikesC, setUserDislikesC, isReplying, setIsReplying, postsData, setPostsData }) => {
  const user = useContext(UserContext)
  // isEditing est un booléen permettant d'afficher ou pas le formulaire d'édition d'un commentaire
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  // isAuthor : booléen qui détermine si l'utilisateur est l'auteur du commentaire (ou l'admin) pour la modif/suppression
  const isAuthor = (comment.user_id === user.uid || user.udroits === 1)
  // isLiked et isDisliked : booléen déterminant si le commentaire a été liké/disliké par l'utilisateur
  const [isLiked, setIsLiked] = useState(userLikesC.includes(comment.id))
  const [isDisliked, setIsDisliked] = useState(userDislikesC.includes(comment.id))
  // image (base) et imageFront (affichage) mémorise l'image éventuellement jointe au post par l'utilisateur
  // le useRef suivant permet d'utiliser un input de type file pour permettre à l'utilisateur de
  // joindre une image à son post tout en occultant cet input et en transférant le traitement sur une icône à cliquer
  const [image, setImage] = useState(null)
  const [imageFront, setImageFront] = useState(null)
  const hiddenImageInput = useRef(null)

  // fonction de traitement des likes :
  //   - un utilisateur ne peut pas voter pour lui-même
  //   - un like est enregistré avec une 'action' à 1 dans la table 'comments_likes', -1 pour un dislike
  //   - si l'utilisateur a déjà liké/disliké un commentaire, le clic suivant sur l'incône correspondante
  //     annule son like/dislike, et 'action' est mis à 0 pour le traitement par l'API
  //   - si l'utilisateur a déjà liké/disliké un post, le clic sur l'icône opposée annule son like/dislike,
  //     et 'action' reste à 1 ou -1 pour le traitement par l'API
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

  // fonction gérant la mise à jour d'un post dans la base suite à un clic sur le bouton 'Valider'
  // les données doivent être formatées sous un formData pour permettre le traitement des img par l'API
  const editComment = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/comments/updatecomment`
    const token = user.utoken
    const commentId = comment.id
    const text = (editContent ? editContent : comment.texte)
    const supprImg = (comment.url_media != null && imageFront === null)
    const obj = {
      id: commentId,
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
          comment.texte = editContent
          setEditContent("")
        }
        if (res.data.imageUrl != undefined) {
          comment.url_media = res.data.imageUrl
          setImageFront(comment.url_media)
        }
        if (supprImg) {
          comment.url_media = null
          setImageFront(null)
        }
      })
  }

  // supprime un commentaire de la table 'comments' suite au clic sur le bouton 'Supprimer'
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

  // permet d'afficher le formulaire de création de commentaire suite à un clic sur le bouton 'Répondre'
  const reply = () => {
    if (user.udroits === 0) setIsReplying(true)
  }

  // évite l'affichage de l'input de type file et permet d'utiliser un bouton custom
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
    setImageFront(comment.url_media)
  }, [])

  // permet de déplacer l'affichage sur le dernier commentaire de la liste lors de l'apparition de
  // cette liste ou à la création d'un nouveau commentaire
  useEffect(() => {
    if (comment.id === commentsData[commentsData.length - 1].id) {
      const scrollToComment = document.getElementById("comment" + comment.id)
      scrollToComment.scrollIntoView(false)
    }
  }, [])

  return (
    <li className="comment" style={{ background: isEditing ? "#f3feff" : "white" }} id={"comment" + comment.id}>

      <div className="comment-header">
        <h3>{comment.user_name}</h3>
        <em>Posté le {dateFormat(comment.date_cre)}</em>
      </div>

      {(imageFront != null) ? <img className="comment-image" src={imageFront} /> : <></>}

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
            value={editContent ? editContent : comment.texte}
            autoFocus
            onChange={(e) => setEditContent(e.target.value)}>
          </textarea>
        </>
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