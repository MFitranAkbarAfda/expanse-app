import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function AddExpenseModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [familyId, setFamilyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // 🔹 Ambil family_id dari profile user login
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

    if (!familyId) {
      alert("Family belum ada, hubungi admin");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("expenses").insert([
      {
        title,
        category_id: categoryId,
        amount: Number(amount),
        expense_date: expenseDate,
        user_id: user.id,
        family_id: familyId,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>Tambah Pengeluaran</h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Judul</label>
            <input
              style={styles.input}
              placeholder="Contoh: Belanja Bulanan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Kategori</label>

            <input
              style={styles.input}
              placeholder="Cari kategori..."
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                setShowCategoryDropdown(true);
              }}
              onFocus={() => setShowCategoryDropdown(true)}
            />

            {showCategoryDropdown && (
              <div style={styles.dropdown}>
                {filteredCategories.length === 0 && (
                  <div style={styles.dropdownItemEmpty}>
                    Kategori tidak ditemukan
                  </div>
                )}

                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    style={styles.dropdownItem}
                    onClick={() => {
                      setCategoryId(cat.id);
                      setCategorySearch(cat.name);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nominal</label>
            <input
              style={styles.input}
              type="number"
              placeholder="Contoh: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tanggal</label>
            <input
              style={styles.input}
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Batal
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
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

  /* 🔥 INI YANG PENTING */
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
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  maxHeight: 180,
  overflowY: 'auto',
  background: '#fff',
  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  zIndex: 50,
},

dropdownItem: {
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 14,
  color: '#000',
},

dropdownItemEmpty: {
  padding: '10px 12px',
  color: '#64748b',
  fontSize: 13,
},

};

export default AddExpenseModal;
