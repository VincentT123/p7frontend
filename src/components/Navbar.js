import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../components/AppContext'

const Navbar = () => {
  const user = useContext(UserContext)
  console.log("nav-id : ", user.uid)
  console.log("nav-token : ", user.utoken)
  const navigate = useNavigate()

  const handleLogout = () => {
    console.log("logout !")
    user.setUserId(null)
    user.setUserToken(null)
    navigate("/")
  }

  return (
    <nav>
      <div className="nav-container">
        <div className="logo">
          <NavLink exact to="/">
            <img src="./img/icon-left-font.png" alt="logo" />
          </NavLink>
        </div>
        {user.uid ? (
          <div className="nav-right">
            <div>Bienvenue </div>
            {user.id}
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