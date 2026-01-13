const express = require("express");
const path = require("path");
const db = require("./database/db");

const app = express();
const PORT = 3000;

// =====================
// MIDDLEWARE
// =====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// =====================
// SAYFALAR
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "add.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

// =====================
// SAHTE LOGIN
// =====================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@site.com" && password === "1234") {
    res.redirect("/list");
  } else {
    res.send("<h3>Hatalı giriş</h3><a href='/login'>Geri dön</a>");
  }
});

// =====================
// LIST + ORTALAMA PUAN (READ)
// =====================
app.get("/list", (req, res) => {
  db.all("SELECT * FROM comments", [], (err, comments) => {
    if (err) return res.send("Veri okunamadı");

    let total = 0;
    comments.forEach(c => total += c.rating);
    const average = comments.length ? (total / comments.length).toFixed(1) : 0;
    const percent = (average / 5) * 100;

    let html = `
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Yorumlar | DiziFilmYorum</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
</head>

<body class="bg-light">

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand fw-bold" href="/">🎬 DiziFilmYorum</a>
    <div>
      <a href="/list" class="btn btn-outline-light btn-sm me-2">Yorumlar</a>
      <a href="/add" class="btn btn-danger btn-sm">Yorum Ekle</a>
    </div>
  </div>
</nav>

<div class="container mt-4">
<h2 class="mb-3">Yorum Listesi</h2>

<p><strong>Ortalama Puan:</strong> ⭐ ${average} / 5</p>

<div class="progress mb-4" style="height:25px;">
  <div class="progress-bar bg-success" style="width:${percent}%">
    ${percent.toFixed(0)}%
  </div>
</div>
`;

    comments.forEach(c => {
      const filledStars = "⭐".repeat(c.rating);
      const emptyStars = "☆".repeat(5 - c.rating);

      html += `
<div class="card comment-card mb-3">
  <div class="card-body">
    <h5 class="card-title">${c.site}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${c.name}</h6>
    <p class="card-text">${c.comment}</p>

    <div style="font-size:1.4rem;">
      ${filledStars}${emptyStars}
    </div>

    <a href="/edit?id=${c.id}" class="btn btn-warning btn-sm mt-2">Düzenle</a>
    <a href="/delete?id=${c.id}" class="btn btn-danger btn-sm mt-2 ms-2">Sil</a>
  </div>
</div>
`;
    });

    html += `
</div>
</body>
</html>
`;

    res.send(html);
  });
});

// =====================
// CREATE
// =====================
app.post("/add", (req, res) => {
  const { name, site, comment, rating } = req.body;

  db.run(
    "INSERT INTO comments (name, site, comment, rating) VALUES (?, ?, ?, ?)",
    [name, site, comment, rating],
    () => res.redirect("/list")
  );
});

// =====================
// DELETE
// =====================
app.get("/delete", (req, res) => {
  db.run("DELETE FROM comments WHERE id = ?", [req.query.id], () => {
    res.redirect("/list");
  });
});

// =====================
// EDIT (FORM)
// =====================
app.get("/edit", (req, res) => {
  db.get("SELECT * FROM comments WHERE id = ?", [req.query.id], (err, c) => {
    if (!c) return res.send("Yorum bulunamadı");

    res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Yorum Düzenle</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container mt-5">
<h3>Yorum Düzenle</h3>

<form method="POST" action="/edit">
<input type="hidden" name="id" value="${c.id}">

<div class="mb-3">
<label>Ad Soyad</label>
<input class="form-control" name="name" value="${c.name}" required>
</div>

<div class="mb-3">
<label>Site</label>
<input class="form-control" name="site" value="${c.site}" required>
</div>

<div class="mb-3">
<label>Yorum</label>
<textarea class="form-control" name="comment" required>${c.comment}</textarea>
</div>

<div class="mb-3">
<label>Puan (1-5)</label>
<input type="number" class="form-control" name="rating" min="1" max="5" value="${c.rating}">
</div>

<button class="btn btn-success">Güncelle</button>
<a href="/list" class="btn btn-secondary ms-2">İptal</a>
</form>
</div>

</body>
</html>
`);
  });
});

// =====================
// UPDATE
// =====================
app.post("/edit", (req, res) => {
  const { id, name, site, comment, rating } = req.body;

  db.run(
    "UPDATE comments SET name=?, site=?, comment=?, rating=? WHERE id=?",
    [name, site, comment, rating, id],
    () => res.redirect("/list")
  );
});

// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor → http://localhost:${PORT}`);
});