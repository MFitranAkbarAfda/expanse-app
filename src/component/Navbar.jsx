import { useState } from 'react'
import { supabase } from '../supabaseClient'

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header style={styles.navbar}>
      <span>Dashboard Pengeluaran</span>

      {/* PROFILE AREA */}
      <div style={styles.profileWrapper}>
        {/* AVATAR */}
        <div
          style={styles.avatar}
          onClick={() => setOpen(!open)}
        >
          U
        </div>

        {/* DROPDOWN */}
        {open && (
          <div style={styles.dropdown}>
            <button style={styles.menuItem}>
              View Profile
            </button>

            <button
              style={{ ...styles.menuItem, color: '#dc2626' }}
              onClick={() => supabase.auth.signOut()}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

const styles = {
  navbar: {
    height: 60,
    background: '#0f172a',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    position: 'relative',
  },

  profileWrapper: {
    position: 'relative',
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  dropdown: {
    position: 'absolute',
    right: 0,
    top: 45,
    background: '#fff',
    color: '#000',
    borderRadius: 8,
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    minWidth: 160,
    overflow: 'hidden',
    zIndex: 100,
  },

  menuItem: {
    color: '#000',
    width: '100%',
    padding: '10px 14px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
}

export default Navbar
