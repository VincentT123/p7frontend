import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../components/AppContext'

const Navbar = () => {
  const user = useContext(UserContext)
  console.log("nav-id : ", user.uid)
  console.log("nav-token : ", user.utoken)
  console.log("nav-prenom : ", user.uprenom)
  const navigate = useNavigate()

  const handleLogout = () => {
    console.log("logout !")
    user.setUserId(null)
    user.setUserToken(null)
    user.setUserNom(null)
    user.setUserPrenom(null)
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
            <div>Bienvenue&nbsp;&nbsp;{user.uprenom}&nbsp;&nbsp;{user.unom}&nbsp;&nbsp;</div>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="nav-right">
            test
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar