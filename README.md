# Project Stacks

1. Framework: [Next JS](https://nextjs.org/) 14 App router
2. Css: [Tailwindcss](https://tailwindcss.com/)
3. UI: [Shadcn UI](https://ui.shadcn.com/docs)
4. Database: PostgresQL at [Supabase](https://supabase.com/)
5. ORM: [Drizzle](https://orm.drizzle.team/)
6. JS Runtime: [Bun](https://bun.sh/)

# [Drizzle Workflow](https://orm.drizzle.team/docs/get-started/postgresql-new)

1. Generate:
   Create and update schema definitions based on your database structure.

   run `bun db:generate`

2. Migrate:
   Apply the generated migrations to update your database schema.

   run `bun db:migrate`

3. Push:
   Push the schema changes to your database to ensure everything is in sync.

   run `bun db:push`
