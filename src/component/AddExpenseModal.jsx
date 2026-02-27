import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import styles from "./AddExpenseModal.module.css"

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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.title}>Tambah Pengeluaran</h3>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {expenses.map((exp, index) => (
              <div key={index} className={styles.rowBox}>
                <div className={styles.rowHeader}>
                  <h4 className={styles.rowTitle}>Data {index + 1}</h4>

                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className={styles.removeBtn}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <input
                  className={styles.input}
                  placeholder="Judul"
                  value={exp.title}
                  onChange={(e) =>
                    updateExpense(index, "title", e.target.value)
                  }
                  required
                />

                <div className={styles.categoryWrapper} >
                  <input
                    className={styles.input}
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
                    <div className={styles.dropdown}>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <div
                            key={cat.id}
                            className={styles.dropdownItem}
                            onClick={() => handleCategorySelect(index, cat)}
                          >
                            {cat.name}
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownItemEmpty}>
                          Kategori tidak ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="number"
                    className={styles.input}
                    style={{ flex: 1 }}
                    placeholder="Nominal"
                    value={exp.amount}
                    onChange={(e) =>
                      updateExpense(index, "amount", e.target.value)
                    }
                    required
                  />

                  <input
                    type="date"
                    className={{ ...styles.input, flex: 1 }}
                    value={exp.expense_date}
                    onChange={(e) =>
                      updateExpense(index, "expense_date", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}

            <div className={styles.actions}>
              <button type="button" onClick={addRow} className={styles.cancelBtn}>
                + Tambah Data
              </button>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Semua"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddExpenseModal;
