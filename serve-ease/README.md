
# FE_Web (Provider)

This is a code bundle for FE_Web (Provider). The original project is available at https://www.figma.com/design/NjHaqneACA1gTlpAe8leya/FE_Web-Provider-.

## Running the code

1. Install dependencies:

```bash
npm i
```

2. Create your local environment file:

```bash
copy .env.example .env
```

3. Set:

- `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:5000`)

4. Start the development server:

```bash
npm run dev
```

## Provider screening flow

- Provider signup submits to backend `POST /api/auth/v2/register`.
- New provider accounts are created as `pending`.
- Admin approval is handled in `serve-ease-admin` via the approval queue (`/provider-applications`).
  
