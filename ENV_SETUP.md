# 🛠️ Environment Variables Setup

Before running the project, you'll need to set up your environment variables. Here's a guide for each variable and how to obtain them:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
DATABASE_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_TAG=
```

---

## 🔐 GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

Used for Google OAuth login.

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Go to **APIs & Services > Credentials**.
4. Click **"Create Credentials" > "OAuth client ID"**.
5. Choose "Web Application", set authorized redirect URIs to:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy the **Client ID** and **Client Secret** into:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 🔑 AUTH_SECRET

A random secret string used to sign authentication tokens.

To generate one, run:

```bash
openssl rand -base64 32
```

Or use an online random string generator.

```env
AUTH_SECRET=your-random-auth-secret
```

---

## 🧪 DATABASE_URL

This is the PostgreSQL connection string from Supabase.

1. Go to your [Supabase project](https://app.supabase.com/).
2. Navigate to **Settings > Database**.
3. Copy the **Connection string** (e.g., `postgresql://user:password@host:port/dbname`).

```env
DATABASE_URL=your-supabase-postgres-url
```

---

## ☁️ Cloudinary Config

To manage and serve images efficiently:

1. Sign up or log in at [Cloudinary](https://cloudinary.com/).
2. Go to your **Dashboard** and copy the following values:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. Choose a default tag to group uploads (optional):

```env
CLOUDINARY_TAG=lampungdev
```

---

## ✅ Final Step

After editing `.env`, restart your dev server:

```bash
bun run dev
```

⚠️ For security reasons, **never commit your `.env` file** to version control.
