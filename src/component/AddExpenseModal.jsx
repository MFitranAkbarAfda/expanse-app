import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function AddExpenseModal({ onClose, onSuccess }) {
  const [familyId, setFamilyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("")
  const [expenses, setExpenses] = useState([
    {
      title: "",
      category_id: "",
      amount: "",
      expense_date: "",
      show_category_dropdown: false,
    },
  ]);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();

      if (error) {
        alert("Gagal mengambil profile");
        return;
      }

      setFamilyId(profile.family_id);
    };

    getProfile();
  }, []);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("id, name")
        .order("name");

      console.log("categories data:", data);
      console.log("categories error:", error);

      if (!error) setCategories(data);
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = expenses.map((e) => ({
      title: e.title,
      category_id: e.category_id,
      amount: Number(e.amount),
      expense_date: e.expense_date,
      user_id: user.id,
      family_id: familyId,
    }));

    const { error } = await supabase.from("expenses").insert(payload);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onSuccess();
    onClose();
  };

  const addRow = () => {
    setExpenses((prev) => [
      ...prev,
      {
        title: "",
        category_id: "",
        amount: "",
        expense_date: "",
      },
    ]);
  };

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Tambah Pengeluaran</h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          {expenses.map((exp, index) => (
            <div key={index} style={styles.rowBox}>
              <h4>Data {index + 1}</h4>

              <input
                style={styles.input}
                placeholder="Judul"
                value={exp.title}
                onChange={(e) => updateExpense(index, "title", e.target.value)}
                required
              />

              <select
                style={styles.input}
                value={exp.category_id}
                onChange={(e) =>
                  updateExpense(index, "category_id", e.target.value)
                }
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                style={styles.input}
                placeholder="Nominal"
                value={exp.amount}
                onChange={(e) => updateExpense(index, "amount", e.target.value)}
                required
              />

              <input
                type="date"
                style={styles.input}
                value={exp.expense_date}
                onChange={(e) =>
                  updateExpense(index, "expense_date", e.target.value)
                }
                required
              />
            </div>
          ))}

          <button type="button" onClick={addRow}>
            + Tambah Data
          </button>

          <button type="submit">Simpan Semua</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    width: "100%",
    maxWidth: 420,
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  },
  title: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 600,
    color: "#0f172a",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    outline: "none",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    color: "#000",
    background: "#fff",
    outline: "none",
    cursor: "pointer",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    color: "#000",
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 500,
    cursor: "pointer",
  },

  dropdown: {
    marginTop: 4,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    maxHeight: 180,
    overflowY: "auto",
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    zIndex: 50,
  },

  dropdownItem: {
    padding: "10px 12px",
    cursor: "pointer",
    fontSize: 14,
    color: "#000",
  },

  dropdownItemEmpty: {
    padding: "10px 12px",
    color: "#64748b",
    fontSize: 13,
  },
};

export default AddExpenseModal;
