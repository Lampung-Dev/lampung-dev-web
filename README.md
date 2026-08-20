# LampungDev Web

A modern web platform built for Lampung developers to collaborate, learn, and grow together.

---

## 🧱 Project Stacks

1. **Framework**: [Next.js 14 App Router](https://nextjs.org/)
2. **CSS**: [Tailwind CSS](https://tailwindcss.com/)
3. **UI Components**: [Shadcn UI](https://ui.shadcn.com/docs)
4. **Database**: PostgreSQL hosted on [Supabase](https://supabase.com/)
5. **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
6. **JavaScript Runtime**: [Bun](https://bun.sh/)
7. **Media Storage & CDN**: [Cloudinary](https://cloudinary.com/)

---

## 🧪 Drizzle Workflow

1. **Generate**:  
   Create or update schema definitions based on your database structure.

    ```bash
    bun db:generate
    ```

2. **Migrate**:  
   Apply the generated migrations to update your database schema.

    ```bash
    bun db:migrate
    ```

3. **Push**:  
   Push schema changes to your database to ensure everything is in sync.

    ```bash
    bun db:push
    ```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:Lampung-Dev/lampung-dev-web.git
cd your-repo-name
```

### 2. Install Bun

If you don’t have Bun installed, follow the [Bun installation guide](https://bun.sh/docs/installation).

### 3. Install Dependencies

```bash
bun install
```

### 4. Create Environment Variables

```bash
cp .env.example .env
```

Then update the `.env` file with your credentials.
For detailed environment setup, check [ENV_SETUP.md](./ENV_SETUP.md).

### 5. Create a New Branch

```bash
git checkout -b your-branch-name
```

#### 💡 Branch Naming Conventions:

-   `feature/your-feature`
-   `fix/your-fix`
-   `enhancement/your-enhancement`
-   `chore/your-task`

Examples:

-   `feature/new-homepage`
-   `fix/login-bug`
-   `enhancement/cart-ui`

### 6. Run the Development Server

```bash
bun run dev
```

### 7. Seed Your Database (Optional)

To populate your local database with sample data, run the seed script:

```bash
bun run seed
```

This script supports the following options:

-   `--refresh`: Clears existing user and social media data before seeding.
-   `--count <number>`: Specifies the total number of users to generate.

**Examples:**

-   To start fresh and create 20 sample users:

    ```bash
    bun run seed -- --refresh --count 20
    ```

-   To add 5 more users to the existing data:
    ```bash
    bun run seed -- --count 5
    ```

### 8. Push Your Changes

```bash
git push origin your-branch-name
```

### 9. Open a Pull Request

Submit a pull request to the `development` branch (or `main` as appropriate) and wait for review. Please make sure all PR checklist items are completed.

---

## 👥 Contributing

We welcome contributions! 🙌

To contribute:

1. Check existing [issues](https://github.com/Lampung-Dev/lampung-dev-web/issues) or create a new one.
2. Comment if you want to work on something.
3. Follow the branch/PR guide above.
4. Submit your PR and we’ll review it together.

For major changes, open an issue first to discuss the idea.

### 📌 Versioning & Changelog Policy

This project strictly follows [Semantic Versioning (SemVer)](https://semver.org/):

- **Patch** (`x.x.+1`): Bug fixes, minor UI/styling tweaks, small refactors.
- **Minor** (`x.+1.0`): New features, new pages, notable enhancements.
- **Major** (`+1.0.0`): Major breaking changes or complete redesigns.

**Requirements for Pull Requests targeting `main`:**
1. Bump the `version` field in `package.json` according to the SemVer rules above.
2. Document all changes in `CHANGELOG.md` under a new version heading (following the existing format).

---

## 💬 Community

Got questions, ideas, or just want to chat?

-   Join our Discord: [LampungDev Discord](https://lampungdev.org/join-discord)
-   Telegram Group: [LampungDev Telegram](https://t.me/lampungdevorg)
-   Whatsapp Group: [LampungDev Whatsapp](https://bit.ly/wagroup-lampungdev)

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 💡 Credits

Made with ❤️ by the [LampungDev](https://lampungdev.org) community.
