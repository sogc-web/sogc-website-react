# SOGC Backend

Express backend scaffold for:

- admin panel backend foundation
- contact form email submission
- volunteer form email submission
- MongoDB connectivity
- Cloudinary configuration

## Start

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Run `npm run dev`

## Current routes

- `GET /api/health`
- `POST /api/forms/contact`
- `POST /api/forms/volunteer`
- `GET /api/admin/bootstrap`

## Notes

- Email runs in `console` mode by default until SMTP is configured.
- MongoDB connection is optional at startup, but required for real admin CRUD work.
- Cloudinary is configured via environment variables and currently scaffolded for the media layer.
