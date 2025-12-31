import { useState } from 'react';
import './Login.css';

// SHA-256 hash of your password - change this to your own!
// To generate: run in browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('')))
const PASSWORD_HASH = 'e17d78ee2071b40ebb4cd8e039fb7ebc51343e0230957c4e164b81a2ce1e0c42';

interface LoginProps {
  onLogin: () => void;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');

    const hash = await hashPassword(password);

    if (hash === PASSWORD_HASH) {
      localStorage.setItem('ideaspark_auth', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
      setPassword('');
    }

    setIsChecking(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>IdeaSpark</h1>
        <p className="login-subtitle">Enter password to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="login-input"
            autoFocus
            disabled={isChecking}
          />

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="login-button"
            disabled={isChecking || !password}
          >
            {isChecking ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
