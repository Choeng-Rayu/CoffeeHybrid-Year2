import React, { useState } from 'react';

export default function EmailForm() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('Sending...');
    
    try {
      const response = await fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email })
      });
      
      const data = await response.text();
      setResult(data);
    } catch (err) {
      setResult('Error sending email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '40px' }}>
      <h2>Send Confirmation Email</h2>
      <form 
        onSubmit={handleSubmit}
        style={{ maxWidth: '400px', margin: 'auto' }}
      >
        <label htmlFor="to">Recipient Email:</label>
        <input
          type="email"
          id="to"
          name="to"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '15px' }}
        />
        <button 
          type="submit"
          disabled={loading}
          style={{
            display: 'block',
            width: '100%',
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '15px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>
      <div className="result" style={{ marginTop: '20px' }}>
        {result}
      </div>
    </div>
  );
}