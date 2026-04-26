function AdminLoadingOverlay({ message = 'Processing....' }) {
  return (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#050707]/55 backdrop-blur-sm">
      <div className="admin-loader" aria-hidden="true" />
      <p className="mt-6 text-sm font-medium uppercase tracking-[0.12em] text-[#f8d35c]">
        {message}
      </p>
    </div>
  )
}

export default AdminLoadingOverlay