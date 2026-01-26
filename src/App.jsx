import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './login.jsx'

import Navbar from './component/Navbar'
import Sidebar from './component/Sidebar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'

function App() {
  const [session, setSession] = useState(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!session) return <Login />

  return (
    <div style={styles.layout}>
      <Sidebar activeMenu={activeMenu} onChangeMenu={setActiveMenu} />

      <div style={styles.main}>
        <Navbar />

        <main style={styles.content}>
          {activeMenu === 'dashboard' && <Dashboard />}
          {activeMenu === 'expenses' && (
            <Expenses userId={session.user.id} />
          )}
        </main>
      </div>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', height: '100vh' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  content: { padding: 24, overflowY: 'auto' },
}

export default App
