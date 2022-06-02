import Log from '../components/Log'

const Profil = () => {

  return (
    <div className="profil-page">
      <div className="profil-log-container">
        <Log signin={false} signup={true} />
      </div>
    </div>
  )
}

export default Profil