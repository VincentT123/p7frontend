import { useState } from "react"
import { UserContext } from "./components/AppContext"
import Routes from "./components/Routes"

function App() {
  const [uid, setUid] = useState(null)
  const [utoken, setUtoken] = useState(null)
  const [unom, setUnom] = useState(null)
  const [uprenom, setUprenom] = useState(null)
  const [udroits, setUdroits] = useState(null)
  const setUserId = (id) => {
    setUid(id)
  }
  const setUserToken = (token) => {
    setUtoken(token)
  }
  const setUserNom = (nom) => {
    setUnom(nom)
  }
  const setUserPrenom = (prenom) => {
    setUprenom(prenom)
  }
  const setUserDroits = (droits) => {
    setUdroits(droits)
  }

  return (
    <UserContext.Provider value={{ uid, setUserId, utoken, setUserToken, unom, setUserNom, uprenom, setUserPrenom, udroits, setUserDroits }}>
      <Routes />
    </UserContext.Provider>
  )
}

export default App
