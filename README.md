# Society of Global Cycle (SOGC)

A premium, modern web presence for the Society of Global Cycle NGO in Ujjain. The site highlights cycling culture, health, clean mobility, and community action through campaigns, events, media coverage, and testimonials. The frontend is live-ready today, with a backend and admin panel planned for content management.

## Highlights

- Premium, elegant UI with a warm cycling and environment-inspired theme
- Multi-section landing page with strong storytelling and impact timeline
- Admin-controlled content areas with safe fallbacks when data is missing
- Language toggle (English + Hindi) with Devanagari font support
- Designed for smooth scrolling, responsiveness, and modern animations

## Tech Stack

Frontend
- React
- Vite
- Custom CSS (premium design system)

Backend (planned)
- Node.js
- Express.js
- MongoDB Atlas
- Nodemailer (Gmail App Password)

## Project Structure

```
Frontend/     # React + Vite app
Backend/      # Node + Express app (planned / in progress)
```

## Local Setup

Frontend

```
cd Frontend
npm install
npm run dev
```

Production build

```
npm run build
```

## Netlify Deployment (Frontend)

Netlify reads settings from `netlify.toml`. The build is configured to use the `Frontend` folder and publish `dist`.

If you deploy manually in the Netlify UI, use:
- Base directory: `Frontend`
- Build command: `npm run build`
- Publish directory: `dist`

## Admin-Controlled Components (with fallback)

These sections will be controlled by the admin panel, but will still show curated static content if admin data is unavailable:
- Campaigns / Initiatives
- Events
- Gallery / Media coverage
- Testimonials

Fallback behavior
- If admin data is missing/unavailable, a curated static list is shown on the public site to avoid empty sections.

## Planned Backend + Admin (Roadmap)

- Secure admin login
- CRUD for campaigns, events, gallery/media, testimonials
- File uploads via Cloudinary
- Volunteer/contact form submissions dashboard
- Mail notifications via Nodemailer (Gmail App Password)

## Developer

ADITYA AERPULE
- GitHub: https://github.com/coder-aadii
- LinkedIn: https://www.linkedin.com/in/aditya-aerpule-a22062309/
- Instagram: https://www.instagram.com/mr_aadi.insane/
