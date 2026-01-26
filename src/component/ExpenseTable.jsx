function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID')
}

function ExpenseTable({ expenses, loading }) {
  if (loading) return <p>Loading...</p>
  if (expenses.length === 0) return <p>Belum ada data</p>

  return (
    <table width="100%" border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Judul</th>
          <th>Kategori</th>
          <th>Nominal</th>
          <th>Tanggal</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((e) => (
          <tr key={e.id}>
            <td>{e.title}</td>
            <td>{e.expense_categories?.name || '-'}</td>
            <td>Rp {Number(e.amount).toLocaleString('id-ID')}</td>
            <td>{formatDate(e.expense_date)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ExpenseTable
