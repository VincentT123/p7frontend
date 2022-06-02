import { useState } from "react"
import { UserContext } from "./components/AppContext"
import Routes from "./components/Routes"

function App() {
  const [uid, setUid] = useState(null)
  const [utoken, setUtoken] = useState(null)
  const setUserId = (id) => {
    setUid(id)
  }
  const setUserToken = (token) => {
    setUtoken(token)
  }

  return (
    <UserContext.Provider value={{ uid, setUserId, utoken, setUserToken }}>
      <Routes />
    </UserContext.Provider>
  )
}

export default App
