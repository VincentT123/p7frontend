import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Profil from '../../pages/Profil'
import Posts from '../../pages/Posts'
import Navbar from '../Navbar'

const index = () => {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Profil />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="*" element={<Profil />} />
        </Routes>
      </Router>
    </div>
  )
}

export default index