import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ErrorPage() {
  const [search] = useState(() => new URLSearchParams(window.location.search));
  const msg = search.get('msg') || '';
  const navigate = useNavigate();

  let errorText = 'We encountered an unexpected issue. Please try again.';
  let errorCode = '';
  if (msg.toLowerCase() === 'network') { errorText = 'Network error — please check your internet connection.'; errorCode = 'NETWORK_FAILURE'; }
  else if (msg.toLowerCase() === 'server') { errorText = 'Server is temporarily unavailable. Try again later.'; errorCode = 'SERVER_ERROR'; }
  else if (msg) { errorCode = msg.toUpperCase(); }

  return (
    <div className="error-page">
      <div className="blob blob-1" /><div className="blob blob-2" />
      <div className="error-card">
        <i className="fas fa-triangle-exclamation error-icon" />
        <h1>Something Went Wrong</h1>
        <p>{errorText}</p>
        <button className="error-btn" onClick={() => navigate('/')}>
          <i className="fas fa-redo" /> Try Again
        </button>
        {errorCode && <div style={{ marginTop: 12, color: '#666', fontSize: '0.85rem' }}>Error Code: {errorCode}</div>}
      </div>
    </div>
  );
}