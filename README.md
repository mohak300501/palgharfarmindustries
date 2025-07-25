# Palghar Farm Industries Portal

Palghar Farm Industries Portal is a community-driven platform for managing and engaging with local farm communities. The portal provides features for members, community admins, and platform administrators, including:

- Community creation and management
- Member registration and profiles
- Posting and commenting within communities
- Public statistics (members, communities, villages)
- Admin dashboard for managing users and communities

## Features

- **Community Management:** Create, edit, and delete communities (admin only)
- **Membership:** Join or leave communities, manage your profile
- **Posts & Comments:** Share posts and comments within communities
- **Statistics:** Public stats for total members, communities, and villages
- **Admin Tools:** Admin dashboard for user and community management

## Updating Public Stats

To update the public stats (members, communities, villages) shown in the footer:

- Stats are updated automatically every hour via GitHub Actions (see `.github/workflows/update-stats.yml`).
- You can also run the update manually:
  1. Add your Firebase Admin SDK JSON as the `FIREBASE_ADMIN_SDK` secret in your GitHub repo settings.
  2. Run the GitHub Actions workflow manually from the Actions tab.
  3. Or, run `node updateStats.js` locally with the appropriate environment variable set.

## Development

- The portal is built with React, TypeScript, and Vite. For framework-specific setup and configuration, see `VITE_README.md`.

## License

MIT
