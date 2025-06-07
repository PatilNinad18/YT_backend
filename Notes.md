# 🚀 Express.js App Setup – Notes (Hinglish)

## 📦 1. express
```js
import express from "express"
const app = express()
```
- Express framework import karte hai.
- `app` object se routes, middleware, config sab handle hota hai.

---

## 🌐 2. cors
```js
import cors from "cors"
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
```
- CORS: Cross-Origin Resource Sharing.
- Frontend (React/Vue) ko backend access karne ki permission.
- `origin`: Allowed frontend ka URL (environment variable se).
- `credentials: true`: Cookies/JWT allow karne ke liye.

---

## 🍪 3. cookie-parser
```js
import cookieParser from "cookie-parser"
app.use(cookieParser())
```
- Request ke sath bheji gayi cookies ko parse karta hai.
- Auth tokens, sessions, etc. read karne ke liye.

---

## 📥 4. express.json()
```js
app.use(express.json({ limit: "16kb" }))
```
- Incoming JSON data parse hota hai (like form ya API body).
- `limit`: Max input size set karne ke liye (security purpose).

---

## 🧾 5. express.urlencoded()
```js
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
```
- HTML form data ko parse karta hai.
- `extended: true`: Nested objects bhi handle karta hai.

---

## 🖼️ 6. express.static()
```js
app.use(express.static("public"))
```
- Static files serve karta hai (images, CSS, JS).
- Example: `/public/logo.png` → `http://localhost:8000/logo.png`

---

## 📤 7. Export app
```js
export { app }
```
- `app` ko `start.js` ya `server.js` mein import karne ke liye export karte hai.

---

## 📁 Recommended Folder Structure

```
/src
 ├── app.js         ← Middleware setup
 ├── routes/
 ├── controllers/
 ├── middlewares/
 └── start.js       ← Server starter file
```

---

## ⚙️ .env Example
```
PORT=8000
CORS_ORIGIN=http://localhost:3000
```

---

## ✅ Summary Table

| Middleware        | Kaam (Hinglish)                                |
|-------------------|------------------------------------------------|
| `cors`            | Frontend ko backend access dena                |
| `cookie-parser`   | Cookies ko parse karna                         |
| `express.json()`  | JSON body ko parse karna                       |
| `express.urlencoded()` | Form data ko handle karna              |
| `express.static()`| Static files serve karna (`public` folder se) |