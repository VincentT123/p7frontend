import { useState } from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../AppContext'
import axios from 'axios'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const user = useContext(UserContext)
  const navigate = useNavigate()
  const test = "abcdef3110"

  const handleLogin = async (e) => {
    e.preventDefault()
    const emailError = document.querySelector('.email.error')
    const passwordError = document.querySelector('.password.error')
    // règles permettant de valider la saisie dans le formulaire de connexion
    const ruleEmail = /^[a-z0-9._-]{2,30}[@][a-z0-9_-]{2,20}[.][a-z]{2,15}$/
    const rulePass = /^[A-Za-z0-9-*+]{8,25}$/

    emailError.innerHTML = ""
    passwordError.innerHTML = ""

    // si les règles définies dans les constantes rule*** ne sont pas respectées alors affichage erreur
    if (!ruleEmail.test(email)) { emailError.innerHTML = "Veuillez entrer une adresse email valide"; return }
    if (!rulePass.test(password)) { passwordError.innerHTML = "8 caractères minimum (lettres, chiffres, +, -, *)"; return }

    // requête vers la base MySQL permettant de valider la connexion
    await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}groupomania/auth/login`,
      headers: { 'Authorization': test },
      data: {
        email,
        password
      },
    })
      .then((res) => {
        console.log("login res : ", res)
        if (res.data.errors) {
          // connexion invalide : affichage du message d'erreur
          emailError.innerHTML = res.data.errors.email
          passwordError.innerHTML = res.data.errors.password
        } else {
          // connexion valide : sauvegarde des données dans le useContext et le sessionStorage
          // et affichage de la page d'accueil des posts
          user.setUserId(res.data.userId)
          user.setUserToken(res.data.token)
          user.setUserNom(res.data.nom)
          user.setUserPrenom(res.data.prenom)
          user.setUserDroits(res.data.droits)
          const userStorageSet = {
            userId: res.data.userId,
            userToken: res.data.token,
            userNom: res.data.nom,
            userPrenom: res.data.prenom,
            userDroits: res.data.droits
          }
          sessionStorage.setItem('user', JSON.stringify(userStorageSet))
          navigate("/posts")
        }
      })
      .catch((err) => {
        console.log("err axios signIn-Form : ", err)
      })
  }

  return (
    <form action="" onSubmit={handleLogin} id="signin">
      <label htmlFor="email">Email</label>
      <br />
      <input
        type="text" name="email" id="email"
        onChange={(e) => setEmail(e.target.value)} value={email}
      />
      <div className="email error"></div>
      <br />
      <label htmlFor="password">Mot de passe</label>
      <br />
      <input
        type="password" name="password" id="password"
        onChange={(e) => setPassword(e.target.value)} value={password}
      />
      <div className="password error"></div>
      <br />
      <input type="submit" value="Se connecter" />
    </form>
  )
}

export default SignIn