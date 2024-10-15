<div align="center"><strong>MediGuide</strong></div>
<div align="center">An AI-powered reminder and monitoring system designed to enhance patient safety by ensuring adherence to medication regimens</div>
<br />

## Overview

The tech stack includes:

- Framework - [Next.js 14](https://nextjs.org/13)
- Language - [TypeScript](https://www.typescriptlang.org)
- Styling - [Tailwind CSS](https://tailwindcss.com)
- Components - [Shadcn-ui](https://ui.shadcn.com)
- Backend - [Python Flask](https://flask.palletsprojects.com/en/3.0.x/#)
- Conversational AI - [Vapi](https://vapi.ai/)
- ORM - [Prisma](https://www.prisma.io/)
- Postgres on the Cloud - [Neon](https://neon.tech/)

## Getting Started

Follow these steps to clone the repository and start the development server:

- `git clone https://github.com/Kiranism/next-shadcn-dashboard-starter.git`
- `npm install`
- Create a `.env.local` file by copying the example environment file:
  `cp env.example.txt .env.local`
- Add the required environment variables to the `.env.local` file.
- `npm run dev`

You should now be able to access the application at http://localhost:3000.

## For Database

- `npm exec prisma migrate dev` and select yes to overwrite data
- `npm exec prisma generate`

## For Flask Server setup (MacOS)

- python -m venv new_env_name
- source new_env_name/bin/activate
- pip install -r requirements.txt
- flask --app app run --port 8000
