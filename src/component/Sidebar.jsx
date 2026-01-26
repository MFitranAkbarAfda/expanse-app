import { supabase } from '../supabaseClient'
function Sidebar({ activeMenu, onChangeMenu }) {
  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.logo}>Expense App</h2>

      <p style={styles.section}>GENERAL</p>
      <MenuItem 
          label="Dashboard" 
          active={activeMenu === 'dashboard'} 
          onClick={() => onChangeMenu('dashboard')} 
      />
      <MenuItem 
          label="Pengeluaran" 
          active={activeMenu === 'expenses'} 
          onClick={() => onChangeMenu('expenses')} />

      <p style={styles.section}>FINANCE</p>
      <MenuItem 
          label="Laporan" 
          active={activeMenu === 'reports'} 
          onClick={() => onChangeMenu('reports')} />

      <p style={styles.section}>SYSTEM</p>
      <MenuItem 
          label="Setting" 
          active={activeMenu === 'settings'} 
          onClick={() => onChangeMenu('settings')} />
    </aside>
  )
}

/**
 * COMPONENT MENU ITEM
 */
function MenuItem({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.item,
        background: active ? '#334155' : 'transparent',
        fontWeight: active ? 'bold' : 'normal',
      }}
    >
      {label}
    </div>
  )
}

const styles = {
  sidebar: {
    width: 240,
    background: '#1e293b',
    color: '#fff',
    padding: 20,
  },
  logo: {
    marginBottom: 30,
  },
  section: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 20,
    marginBottom: 8,
  },
  item: {
    padding: '10px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    marginBottom: 4,
  },
}

export default Sidebar
