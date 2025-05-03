# 📘 GitHub App Clone

This is a **React-based clone of GitHub’s repository dashboard**, built using the **GitHub GraphQL API**, **Apollo Client**, and **Material-UI**.  
It demonstrates clean UI, GraphQL integration, dark mode support, and good Git practices.

---

## 🚀 Features

- 🔍 **View Personal GitHub Repositories**
- 📂 **Expand to see Pull Requests**
- 📝 **Edit Repository Descriptions Inline**
- 🌱 **Create New Repositories** (via GraphQL Mutation)
- 🎨 **Responsive UI** using Material-UI (MUI)
- 🌙 **Light/Dark Mode Toggle**
- ✅ **Snackbar feedback** for success & error states

---

## ⚙️ Tech Stack Upgrade Notes

### Original Stack

- `react: ^16.10.1`
- `@apollo/client: ^3.6.2`
- `@material-ui/core: ^4.12.4`
- Manual **Webpack** configuration

---

### Planned Upgrade (Optional)

- ✅ **Migrate to React 18** using Vite
- ✅ **Upgrade to MUI v7** (from v4)
- ✅ **Use React Router and Suspense** for routing and lazy loading
- ✅ **Split into pages/components for scalability**

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/github-clone-app.git
cd github-clone-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your GitHub Token

Create a `.env` file in the root:

```
REACT_APP_GITHUB_TOKEN=your_personal_access_token
```

> Make sure your token has `repo` scope.

### 4. Start the app

```bash
npm start
```

---

## 🔧 Available Scripts

| Command        | Description                         |
|----------------|-------------------------------------|
| `npm start`    | Start the development server        |
| `npm run build`| Bundle for production (via Webpack) |
| `npm run lint` | Run linting                         |

---

## 📁 Folder Structure

```
src/
  ├── components/           // Reusable UI components (form, layout)
  ├── mutations/            // GraphQL mutation files
  ├── queries/              // GraphQL queries
  ├── apolloClient.js       // Apollo Client setup
  ├── App.js                // Main UI
  └── index.js              // App entrypoint
```

---

## 🖼 Demo

> 📸 Add screenshots here (UI in both light and dark mode, if deployed)

---

## 🧪 Future Enhancements

- 🔄 Pagination support
- 🗂️ Sort/filter repositories
- 🧪 Unit testing (Jest + React Testing Library)
- 🚀 Deployment via Vercel or Netlify

---
The app will run on `http://localhost:3000`.

---

## 🧪 Testing

> Manual UI testing has been used. Unit tests are recommended for future iterations using **Jest** and **React Testing Library**.

### Suggested Future Test Cases

- Create repo mutation success and error
- Repository and PR rendering logic
- Snackbar appearance on mutation events
- Dark/light mode toggle behavior

---

## 💡 Learning Objectives

- Learn GitHub GraphQL API structure (viewer, repository, pullRequest)
- Practice Apollo Client & query caching
- Build scalable UI using MUI
- Manage theme state via context (light/dark mode)

---

## 👤 Author

**Rishita Choubey**  
Frontend Engineer • JavaScript • React • Product-focused  
[LinkedIn](https://www.linkedin.com/in/rishitachoubey)

---

## 📝 License

MIT — feel free to fork and modify for learning purposes.