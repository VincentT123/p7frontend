import { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../components/AppContext'
import axios from 'axios'
import Post from '../components/Post'
import ScrollToTop from '../components/ScrollToTop'

const Posts = () => {
  const user = useContext(UserContext)
  // postsData mémorise la liste des posts obtenue avec la requête sur la table 'posts' de la base MySQL
  const [postsData, setPostsData] = useState([])
  // userLikes et userDislikes mémorisent tous les likes et les dislikes de l'utilisateur obtenus avec
  // la requête sur la table 'posts_likes'
  const [userLikes, setUserLikes] = useState([])
  const [userDislikes, setUserDislikes] = useState([])
  // isCreating est un booléen permet d'afficher ou pas le formulaire de création de post
  const [isCreating, setIsCreating] = useState(false)
  const [content, setContent] = useState("")
  const [error, setError] = useState(false)
  // image (base) et imageFront (affichage) mémorise l'image éventuellement jointe au post par l'utilisateur
  // le useRef suivant permet d'utiliser un input de type file pour permettre à l'utilisateur de
  // joindre une image à son post tout en occultant cet input et en transférant le traitement sur une icône à cliquer
  const [image, setImage] = useState(null)
  const [imageFront, setImageFront] = useState(null)
  const hiddenImageInput = useRef(null)

  // traitement du formulaire de création de post et requête de création sur la table 'posts' suite à
  // un clic sur le bouton 'Envoyer'
  const createPost = (e) => {
    e.preventDefault()
    if (content.length < 2 || content.length > 2000) {
      setError(true)
    } else {
      // la requête de création de post se fait à l'adresse paramétrée dans le fichier .env
      const url = `${process.env.REACT_APP_API_URL}groupomania/posts/createpost`
      const token = user.utoken
      const uname = user.uprenom + " " + user.unom
      const obj = {
        texte: content,
        user_id: user.uid,
        user_name: uname
      }
      // les données de la requête doivent être formatées dans un formData pour permettre le traitement
      // des images par l'API
      const json = JSON.stringify(obj)
      const formData = new FormData()
      formData.append("image", image)
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
        .then(() => {
          setIsCreating(false)
          setError(false)
          setContent("")
          setImage(null)
          setImageFront(null)
          getData()
          window.scrollTo(0, 0)
        })
    }
  }

  // fonction permettant de récupérer les données utilisateur de la session et de la transmettre
  // grâce au useContext à tous les composants les nécessitant
  const getStorage = () => {
    const userStorageGet = JSON.parse(sessionStorage.getItem('user'))
    user.setUserId(userStorageGet.userId)
    user.setUserToken(userStorageGet.userToken)
    user.setUserNom(userStorageGet.userNom)
    user.setUserPrenom(userStorageGet.userPrenom)
    user.setUserDroits(userStorageGet.userDroits)
  }

  // fonction permettant d'établir la liste des posts à afficher
  const getData = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/posts/listposts`
    const token = user.utoken
    axios({
      method: 'get',
      url: url,
      headers: { 'authorization': token }
    })
      .then((res) => {
        setPostsData(res.data.results)
      })
      .catch((err) => console.log("erreur axios listposts : ", err))
  }

  // fonction récupérant tous les likes/dislikes de l'utilisateur
  const getLikes = () => {
    const url = `${process.env.REACT_APP_API_URL}groupomania/posts/userlikes`
    const token = user.utoken
    axios({
      method: 'post',
      url: url,
      headers: { 'authorization': token },
      data: { id: user.uid }
    })
      .then((res) => {
        setUserLikes(Array.from(res.data.results.filter(item => item.action === 1), item => item.post_id))
        setUserDislikes(Array.from(res.data.results.filter(item => item.action === -1), item => item.post_id))
      })
      .catch((err) => console.log("erreur axios userlikes : ", err))
  }

  // pour éviter l'affichage de l'input basique de type file et d'utiliser un bouton custom à la place
  const handleImageClick = (e) => {
    hiddenImageInput.current.click()
  }

  // mémorise l'éventuelle image jointe au post par l'utilisateur 
  const addImage = (e) => {
    setImageFront(URL.createObjectURL(e.target.files[0]))
    setImage(e.target.files[0])
  }

  // efface les données image mémorisées suite au clic sur l'icône 'supprimer l'image'
  const deleteImage = () => {
    setImage(null)
    setImageFront(null)
  }

  // réception des données utilisateur, lecture de la base pour établir la liste des posts
  // et tous les likes/dislikes de l'utilisateur sur les posts
  useEffect(() => {
    getStorage()
    getData()
    getLikes()
  }, [user])

  return (
    <div className="posts-page">
      <ScrollToTop />
      <div className="posts-page-header">
        {/* test sur user.droits pour interdire la création de posts pour l'admin*/}
        <button type="button" onClick={() => { if (user.udroits === 0) setIsCreating(true) }} className="btn-create-post">ECRIRE UN COMMENTAIRE</button>
        <button type="button" onClick={() => { getData(); getLikes() }} className="btn-refresh">ACTUALISER</button>
      </div>
      <br />
      {isCreating &&
        <form action="" onSubmit={(e) => createPost(e)} id="form-create-post">
          {(imageFront != null) ? <img className="post-img-to-upload" src={imageFront} alt="to upload" /> : <></>}
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
            style={{ border: error ? "1px solid red" : "1px solid #61dafb" }}
            placeholder="Message"
            onChange={(e) => setContent(e.target.value)}
            value={content}>
          </textarea>
          {error && <p>Veuillez saisir entre 2 et 2000 caractères</p>}
          <div className="create-post-footer">
            <input type="submit" value="Envoyer" className="create-post-submit" />
            <button type="button" className="create-post-cancel" onClick={() => {
              setIsCreating(false)
              setContent("")
              setImage(null)
              setImageFront(null)
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
