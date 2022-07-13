import { NavLink } from 'react-router-dom'
import { useMediaPredicate } from "react-media-hook";
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../components/AppContext'

const Navbar = () => {
  const user = useContext(UserContext)
  const navigate = useNavigate()
  // définition des constantes de seuil pour l'affichage des boutons texte ou des boutons symbole
  // selon la taille de l'écran (grâce à la library react-media-hook)
  const largeScreen = useMediaPredicate("(min-width: 769px)")
  const smallScreen = useMediaPredicate("(max-width: 768px)")

  // fonction permettant la deconnexion déclenchée au clic sur le bouton 'Logout'
  // et affichage du formulaire d'inscription/connexion
  const handleLogout = () => {
    console.log("logout !")
    user.setUserId(null)
    user.setUserToken(null)
    user.setUserNom(null)
    user.setUserPrenom(null)
    sessionStorage.clear()
    navigate("/")
  }

  return (
    <nav>
      <div className="nav-container">
        <div className="logo">
          <img src="./img/icon-left-font.png" alt="logo" />
        </div>
        {user.uid ? (
          <div className="nav-right">
            <div className="user-bloc">
              <i className="fas fa-user-circle avatar"></i>
              <span className="user-name">{user.uprenom}&nbsp;&nbsp;{user.unom}</span>
            </div>
            {largeScreen && <button type="button" onClick={handleLogout}>Logout</button>}
            {smallScreen && <i onClick={handleLogout} className="fas fa-sign-out-alt btn-logout"></i>}
          </div>
        ) : (
          <div className="nav-right">
            Réseau social
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar