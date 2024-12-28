# Project Stacks

1. **Framework**: [Next.js 14 App Router](https://nextjs.org/)
2. **CSS**: [Tailwind CSS](https://tailwindcss.com/)
3. **UI Components**: [Shadcn UI](https://ui.shadcn.com/docs)
4. **Database**: PostgreSQL hosted on [Supabase](https://supabase.com/)
5. **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
6. **JavaScript Runtime**: [Bun](https://bun.sh/)

---

## Drizzle Workflow

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

## How to Clone and Run the Project

1. **Clone the Repository**:  
   Clone this repository to your local machine.

2. **Install Bun**:  
   If you don’t have Bun installed, follow the [Bun installation guide](https://bun.sh/docs/installation).

3. **Install Dependencies**:  
   Run the following command:

   ```bash
   bun install
   ```

4. **Create a New Branch**:  
   To develop from the main branch, create a new branch:

   ```bash
   git checkout -b your-branch-name
   ```

   ### Branch Naming Conventions

   - Use prefixes like `feature/`, `fix/`, `enhancement/`, or `chore/`.
   - Keep the branch name descriptive.
   - Example branch names:
     - `feature/new-homepage`
     - `fix/login-bug`
     - `enhancement/cart-ui`
     - `chore/update-dependencies`

5. Create .env file, run this command in the terminal:

   ```bash
   cp .env.example .env
   ```

6. **Run the Development Server**:  
   Start the development server with:

   ```bash
   bun run dev
   ```

7. **Push Your Changes**:  
   After completing your work, push to your branch:

   ```bash
   git push origin your-branch-name
   ```

8. **Create a Pull Request**:  
   Open a pull request to the `development` branch.

9. **Happy Coding**! 😊

---

## Environment Variables

To access the required `.env` file, please contact **@amirfaisalz**.

---
