TrackSphere

A modern asset management and tracking application built with React and Firebase.
TrackSphere helps businesses monitor their digital assets in real-time with features like AI-powered assistance, secure authentication, interactive dashboards, and categorized security tiers.
The application includes features such as:
Real-time asset management
AI-based assistant
GitHub profile lookup
Weather insights
Dashboard analytics
Firebase authentication & Firestore storage
Responsive UI with clean design 
APIs Used

1. Google Gemini API
Endpoint:
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
Purpose: AI chatbot assistant

2. Firebase Authentication
Purpose: User login and registration

3. Firebase Firestore
Purpose: Database storage for assets and user data

4. GitHub API
Endpoint:
https://api.github.com/users/{username}
Purpose: GitHub profile search and display

5. JSONPlaceholder API
Endpoint:
https://jsonplaceholder.typicode.com/posts?_limit=6
Purpose: Sample dashboard posts

6. Open-Meteo API
Endpoint:
https://api.open-meteo.com/v1/forecast
Purpose: Weather data display

Prerequisites
Node.js v14+
Firebase account
Google Gemini API key

1. Clone the repository
git clone https://github.com/M-Huzaifa-Bin-Amir/TrackSpace.git
cd tracksphere

2. Install dependencies
npm install

3. Configure Firebase
Update the file: src/services/firebase.js
with your Firebase credentials.

4. Configure Gemini API
Add your API key inside: src/components/AskAI.js

Run the Application
npm start
Then open the app in your browser:
http://localhost:3000

work division
Memeber 1:Tazeen Gull(23I-2055) implemented the React project setup, created modular components, implemented navigation, loaded content dynamically from JSON, fetched data from a public API, added a video element, styled the app with Tailwind CSS.

Member 2: Huzaifa Amir(23I-2095) implemented forms and Firebase integration, added a Local Storage or Cookies feature, created interactivity like search bar, filter, theme toggle, and AI chat box, built the GitHub user search page using the GitHub API, and tested all interactive features for functionality and responsiveness, and managed GitHub commits and branches.