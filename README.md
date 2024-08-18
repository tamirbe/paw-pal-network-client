Client README
Project Name: Interest-Based Social Network Client
Overview
This project is the frontend client for an interest-based social network where users can interact with posts related to their interests. The frontend is built using Angular.

Features
User login and registration.
Users can search for interests and follow/unfollow them.
Users can see posts related to their followed interests.
Users can like, unlike, share, and save posts.
The UI is dynamically updated to reflect the user's interactions with posts.
Posts are displayed with details like author, creation date, likes, shares, and the ability to save.
Prerequisites
Node.js
Angular CLI
Git
Installation and Setup
Clone the repository:

bash
Copy code
git clone <client-repo-url>
cd <client-repo-directory>
Install dependencies:

bash
Copy code
npm install
Configure environment variables:
Update the src/environments/environment.ts file with the API URL:

typescript
Copy code
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
Start the client:

bash
Copy code
npm run start
The client will be running at http://localhost:4200.

Usage
After starting the server and client, open http://localhost:4200 in your browser.
Register or log in with your credentials.
Navigate through the application to explore interests, follow them, and interact with posts.
Troubleshooting
Ensure the backend server is running and accessible at the specified apiUrl.
Make sure all dependencies are installed correctly with npm install.
If any errors occur, refer to the browser console or terminal output for more details.
