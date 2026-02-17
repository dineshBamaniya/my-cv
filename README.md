# My CV Site

A modern CV website built with Next.js, React, and Tailwind CSS.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js app directory containing pages and layouts
- `app/page.tsx` - Main CV page
- `app/layout.tsx` - Root layout component
- `app/globals.css` - Global styles with Tailwind CSS
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration

## Customization

Edit `app/page.tsx` to customize your CV content. The page includes sections for:

- Professional Summary
- Work Experience
- Education
- Skills
- Projects

## Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

This Next.js project is ready to deploy on Vercel. Vercel will automatically detect Next.js and configure the deployment.

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your Git repository
5. Vercel will automatically detect Next.js and configure the build settings
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI globally:

   ```bash
   npm i -g vercel
   ```

2. Deploy to production:

   ```bash
   vercel
   ```

3. For preview deployments:
   ```bash
   vercel --prod
   ```

### Build Settings (Auto-detected by Vercel)

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or `next build`)
- **Output Directory**: `.next` (automatically handled by Next.js)
- **Install Command**: `npm install`

### Environment Variables

If you need to add environment variables:

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add your variables for Production, Preview, and Development environments

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Deployment Documentation](https://vercel.com/docs)
