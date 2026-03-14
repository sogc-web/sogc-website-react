function Loader({ text }) {
  return (
    <div className="loader">
      <img className="loader__gif" src="/loader.gif" alt="Loading" />
      <p>{text}</p>
    </div>
  )
}

export default Loader
