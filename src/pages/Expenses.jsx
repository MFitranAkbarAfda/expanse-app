import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ExpenseTable from "../component/ExpenseTable";
import AddExpenseModal from "../component/AddExpenseModal";

function Expenses({ userId }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);

     const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('id', userId)
      .single()

       if (profileError) {
    alert(profileError.message)
    setLoading(false)
    return
  }

  const familyId = profile?.family_id

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
    id,
    title,
    amount,
    expense_date,
    expense_categories!expenses_category_id_fkey (
      name
    )
  `,
      )
      .eq('family_id', familyId)
      .order("expense_date", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setExpenses(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <>
      <div style={styles.header}>
        <h2 style={styles.title}>Pengeluaran</h2>

        <button onClick={() => setShowModal(true)} style={styles.addButton}>
          + Tambah Pengeluaran
        </button>
      </div>

      <ExpenseTable expenses={expenses} loading={loading} />

      {showModal && (
        <AddExpenseModal
          userId={userId}
          onClose={() => setShowModal(false)}
          onSuccess={fetchExpenses}
        />
      )}
    </>
  );
}

const styles = {
  addButton: {
    width: "150px",
    height: 28,
    padding: "0 10px",
    fontSize: 12,
    lineHeight: "28px",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 20,
  },
};

export default Expenses;
