import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function AddExpenseModal({ onClose, onSuccess }) {
  const [familyId, setFamilyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [expenses, setExpenses] = useState([
    {
      title: "",
      category_id: "",
      category_name: "",
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
        show_category_dropdown: false,
      },
    ]);
  };

  const removeRow = (index) => {
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const handleCategorySelect = (index, category) => {
    const updated = [...expenses];
    updated[index].category_id = category.id;
    updated[index].category_name = category.name;
    updated[index].show_category_dropdown = false;
    setExpenses(updated);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Tambah Pengeluaran</h3>

        <div style={styles.content}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {expenses.map((exp, index) => (
              <div key={index} style={styles.rowBox}>
                <div style={styles.rowHeader}>
                  <h4 style={styles.rowTitle}>Data {index + 1}</h4>

                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      style={styles.removeBtn}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <input
                  style={styles.input}
                  placeholder="Judul"
                  value={exp.title}
                  onChange={(e) =>
                    updateExpense(index, "title", e.target.value)
                  }
                  required
                />

                <div style={{ position: "relative" }}>
                  <input
                    style={styles.input}
                    placeholder="Pilih / ketik kategori"
                    value={exp.category_name}
                    onChange={(e) => {
                      updateExpense(index, "category_name", e.target.value);
                      updateExpense(index, "show_category_dropdown", true);
                      setCategorySearch(e.target.value);
                    }}
                    onFocus={() =>
                      updateExpense(index, "show_category_dropdown", true)
                    }
                    required
                  />

                  {exp.show_category_dropdown && (
                    <div style={styles.dropdown}>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <div
                            key={cat.id}
                            style={styles.dropdownItem}
                            onClick={() => handleCategorySelect(index, cat)}
                          >
                            {cat.name}
                          </div>
                        ))
                      ) : (
                        <div style={styles.dropdownItemEmpty}>
                          Kategori tidak ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="number"
                    style={{ ...styles.input, flex: 1 }}
                    placeholder="Nominal"
                    value={exp.amount}
                    onChange={(e) =>
                      updateExpense(index, "amount", e.target.value)
                    }
                    required
                  />

                  <input
                    type="date"
                    style={{ ...styles.input, flex: 1 }}
                    value={exp.expense_date}
                    onChange={(e) =>
                      updateExpense(index, "expense_date", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}

            <div style={styles.actions}>
              <button type="button" onClick={addRow} style={styles.cancelBtn}>
                + Tambah Data
              </button>

              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Semua"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  content: {
    maxHeight: "70vh",
    overflowY: "auto",
    paddingRight: 4,
  },

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
    maxHeight: "80vh",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
  },

  title: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 600,
    color: "#0f172a",
  },
  rowBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#f8fafc",
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
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
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

  rowHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 6,
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
  },

  removeBtn: {
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    width: 35,
    height: 33,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: "2px",
    textAlign: "center",
  },
};

export default AddExpenseModal;
