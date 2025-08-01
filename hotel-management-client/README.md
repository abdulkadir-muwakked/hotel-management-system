# Hotel Management System – Client

This is the front-end (client) for the Hotel Management System, built with Next.js, React, and Tailwind CSS. It provides a modern, responsive interface for managing hotel rooms, reservations, users, brokers, and payments.

## Features

- **Room Management**: Create, edit, view, and filter rooms by type (Student, Medical, Customer).
- **Reservation Management**: Book, edit, and view reservations with support for multiple guests, brokers, and payment tracking.
- **User Management**: Manage users with roles (admin, receptionist, broker, customer, etc.), including document uploads and avatars.
- **Broker Management**: Track brokers and their reservation statistics.
- **Payments**: Add, edit, and track payments for reservations.
- **Calendar View**: Visualize reservations on a timeline calendar with room and guest filters.
- **Dashboard**: See key stats, charts, and quick actions for daily operations.
- **Responsive Design**: Works on desktop and mobile devices.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, or pnpm
- The backend API for the hotel management system (see backend repo)

### Installation

1. Clone this repository:
   ```sh
   git clone <repo-url>
   cd hotel-management-client
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to your backend API URL.

### Running the App

```sh
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app/` – Main app pages (rooms, reservations, users, brokers, dashboard, calendar)
- `src/components/` – Reusable UI components
- `src/contexts/` – React context providers (auth, users, rooms, reservations)
- `src/lib/utils.js` – API utilities and custom hooks
- `public/` – Static assets

## Customization

- **Room Types**: Room types are managed via the backend and can be filtered in the UI.
- **Roles & Permissions**: User roles are enforced in both backend and frontend.
- **Styling**: Uses Tailwind CSS for easy customization.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

For backend/API setup and more details, see the backend repository.
