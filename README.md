# 🚀 Vial Forms Backend

## 🛠️ Getting Started

### 1. Clone the repo and install dependencies

```bash
git clone https://github.com/hlebon/vial-forms-be.git
cd vial-forms-be
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

### 3. Start the project with Docker and apply database migration and seed

```
docker compose build
docker compose up
npm run migrate
npm run seed
```

## 🔍 Test the API

```bash
curl --location 'http://127.0.0.1:8080/form/{your_form_id}' \
  --header 'Content-Type: application/json'
```

Replace `{your_form_id}` with an actual form ID from the seeded data.

## 🌐 API Documentation

Once the server is running, you can access the interactive Swagger UI at: `http://127.0.0.1:8080/documentation`

## 📦 Related Projects
Frontend Repo: Vial Forms FE

Make sure to set the backend host in the FE .env file:

`VITE_API_BASE_URL=http://127.0.0.1:8080`
