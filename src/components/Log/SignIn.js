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
    console.log("handleLogin")
    await axios({
      method: "post",
      url: `${process.env.REACT_APP_API_URL}groupomania/auth/login`,
      //withCredentials: true,
      //headers: {'X-Custom-Header': 'foobar'},
      //headers: req.headers.set('Authorization', 'Bearer ' + authToken),
      headers: { 'Authorization': test },
      data: {
        email,
        password
      },
    })
      .then((res) => {
        if (res.data.errors) {
          emailError.innerHTML = res.data.errors.email
          passwordError.innerHTML = res.data.errors.password
        } else {
          console.log("data : ", res.data)
          user.setUserId(res.data.userId)
          user.setUserToken(res.data.token)
          navigate("/posts")
        }
      })
      .catch((err) => {
        console.log("err axios signinform : ", err)
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