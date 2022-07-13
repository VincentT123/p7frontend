import { useState } from 'react'
import axios from 'axios'
import SignIn from './SignIn'

const SignUp = () => {
  const [formSubmit, setFormSubmit] = useState(false)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [controlPassword, setControlPassword] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    const terms = document.getElementById('terms')
    const nomError = document.querySelector('.nom.error')
    const prenomError = document.querySelector('.prenom.error')
    const emailError = document.querySelector('.email.error')
    const passwordError = document.querySelector('.password.error')
    const passwordConfirmError = document.querySelector('.password-confirm.error')
    const termsError = document.querySelector('.terms.error')
    // règles permettant de valider la saisie dans le formulaire d'inscription
    const ruleNom = /^[A-Za-z-' ]{1,30}$/
    const rulePrenom = /^[A-Za-z- ]{1,30}$/
    const ruleEmail = /^[a-z0-9._-]{2,30}[@][a-z0-9_-]{2,20}[.][a-z]{2,15}$/
    const rulePass = /^[A-Za-z0-9-*+]{8,25}$/

    nomError.innerHTML = ""
    prenomError.innerHTML = ""
    emailError.innerHTML = ""
    passwordError.innerHTML = ""
    passwordConfirmError.innerHTML = ""
    termsError.innerHTML = ""

    // si les règles définies dans les constantes rule*** ne sont pas respectées alors affichage erreur
    if (!ruleNom.test(nom)) { nomError.innerHTML = "1 à 30 caractères (lettres, tiret, apostrophe)"; return }
    if (!rulePrenom.test(prenom)) { prenomError.innerHTML = "1 à 30 caractères (lettres, tiret)"; return }
    if (!ruleEmail.test(email)) { emailError.innerHTML = "Veuillez entrer une adresse email valide"; return }
    if (!rulePass.test(password)) { passwordError.innerHTML = "8 caractères minimum (lettres, chiffres, +, -, *)"; return }

    if (password !== controlPassword || !terms.checked) {
      if (password !== controlPassword) {
        passwordConfirmError.innerHTML = "Les mots de passe ne correspondent pas"
      }
      if (!terms.checked) {
        termsError.innerHTML = "Veuillez valider les conditions générales"
      }
    } else {
      // requête vers la base MySQL permettant de valider l'inscription
      await axios({
        method: "post",
        url: `${process.env.REACT_APP_API_URL}groupomania/auth/signup`,
        data: {
          nom,
          prenom,
          email,
          password
        }
      })
        .then((res) => {
          if (res.data.errors) {
            // inscription invalide : affichage du message d'erreur
            nomError.innerHTML = res.data.errors.nom
            prenomError.innerHTML = res.data.errors.prenom
            emailError.innerHTML = res.data.errors.email
            passwordError.innerHTML = res.data.errors.password
          } else {
            // connexion valide : message inscription réussie et affichage du formulaire de connexion
            setFormSubmit(true)
          }
        })
        .catch((err) => {
          console.log("err axios signUp-Form : ", err)
        })
    }
  }

  return (
    <>
      {formSubmit ? (
        <>
          <SignIn />
          <span></span>
          <h4 className="success">Enregistrement réussi, veuillez vous connecter</h4>
        </>
      ) : (
        <form action="" onSubmit={handleRegister} id="signup">

          <label htmlFor="nom">Nom</label>
          <br />
          <input
            type="text" name="nom" id="nom"
            onChange={(e) => setNom(e.target.value)} value={nom}
          />
          <div className="nom error"></div>
          <br />

          <label htmlFor="prenom">Prenom</label>
          <br />
          <input
            type="text" name="prenom" id="prenom"
            onChange={(e) => setPrenom(e.target.value)} value={prenom}
          />
          <div className="prenom error"></div>
          <br />

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

          <label htmlFor="password-conf">Confirmer mot de passe</label>
          <br />
          <input
            type="password" name="password-conf" id="password-conf"
            onChange={(e) => setControlPassword(e.target.value)} value={controlPassword}
          />
          <div className="password-confirm error"></div>
          <br />

          <input type="checkbox" id="terms" />
          <label htmlFor="terms">
            &nbsp;&nbsp;J'accepte les&nbsp;&nbsp;<a href="/" target="" rel="noopener noreferrer">conditions générales</a>
          </label>
          <div className="terms error"></div>
          <br />

          <input type="submit" value="Valider inscription" />

        </form>
      )}
    </>
  )
}

export default SignUp