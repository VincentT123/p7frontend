import { useState } from "react"
import SignIn from "./SignIn"
import SignUp from "./SignUp"

const Log = (props) => {

  // selon la valeur modale le formulaire affiché sera soit celui du signUp, soit celui du signIn
  const [signUpModal, setSignUpModal] = useState(props.signup)
  const [signInModal, setSignInModal] = useState(props.signin)

  const handleModals = (e) => {
    if (e.target.id === "register") {
      setSignInModal(false)
      setSignUpModal(true)
    } else if (e.target.id === "login") {
      setSignUpModal(false)
      setSignInModal(true)
    }
  }

  return (
    <div className="log-form-container">
      <div className="log-form-header">
        <button type="button" onClick={handleModals} id="register" className={signUpModal ? "active-btn" : null}>S'inscrire</button>
        <button type="button" onClick={handleModals} id="login" className={signInModal ? "active-btn" : null}>Se connecter</button>
      </div>
      {signUpModal && <SignUp />}
      {signInModal && <SignIn />}
    </div>
  )
}

export default Log