Interest-Based Social Network - Client
Overview
This project is the frontend client for an interest-based social network, where users can follow interests, like posts, share posts, and interact with content shared by other users. The client is built using Angular, and it connects to a Node.js and Express backend server.

Features
User Authentication: Login and registration with form validation.
Interest Management: Users can follow and unfollow interests, and view posts related to these interests.
Post Interactions: Users can create, like, unlike, share, and save posts.
Dynamic Feed: The feed includes system posts, user posts, interest-based posts, and shared posts.
Profile Management: Users can edit their profile, change their password, manage their posts, and view their saved posts and followed interests.
Search Functionality: Users can search for other users and follow/unfollow them.
Responsiveness: The UI is responsive and adapts to different screen sizes.
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
Ensure the backend server is running and update the apiUrl in the services to point to the correct backend server URL.

Start the client:
bash
Copy code
npm run start
The client will be running at http://localhost:4200.

Note: If you are running the server on a free hosting service, the server may take approximately 40 seconds to start initially. Please be patient.

Project Structure
src/app/components/: Contains reusable components like headers and footers.
src/app/pages/: Contains the main pages, such as home, profile, interests, search results, and about.
src/app/services/: Contains services that interact with the backend API for authentication, post management, etc.
src/app/models/: Contains interfaces for data models like Post, User, Interest, etc.
src/app/guards/: Contains route guards for protecting certain routes based on authentication status.
Running the Client
To start the client locally, run the following command after installing dependencies:

bash
Copy code
npm run start
The client will start on http://localhost:4200.

API Integration
The client interacts with the backend API to handle various features like user authentication, post interactions, and interest management. Ensure the backend server is running before starting the client.

Troubleshooting
Ensure the backend server is up and running, and the apiUrl is correctly set.
Check the console for any errors or warnings during the startup process.
For any authentication issues, ensure the JWT token is valid and correctly stored in local storage.
Example Configuration
In your Angular services or environment configuration, make sure the apiUrl points to your backend server:

typescript
Copy code
private apiUrl = 'http://localhost:3000'; // Adjust this to your backend URL
This README provides a comprehensive overview of the client setup, features, and usage. It is structured to be clear and informative for anyone setting up or working with the client project.






