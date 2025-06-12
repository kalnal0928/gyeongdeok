# School Meal Info Project

This project provides a web application that displays school meal information using a meal API. The application fetches data based on an API key and presents it in a user-friendly format.

## Project Structure

```
school-meal-info
├── src
│   ├── js
│   │   ├── app.js          # Entry point for the application, manages API calls and initializes the app.
│   │   └── api.js          # Handles communication with the meal API, fetching meal information using the API key.
│   ├── css
│   │   ├── style.css       # Basic styles for the web pages.
│   │   └── responsive.css   # Styles for responsive design.
│   ├── pages
│   │   ├── index.html      # Main page structure displaying meal information.
│   │   └── meal-detail.html # Page for displaying detailed information about a specific meal.
│   └── assets
│       └── images          # Folder for storing images used in the project.
├── public
│   └── index.html          # HTML file served to the end user, containing the basic structure of the web application.
├── .env                    # File for storing environment variables, including sensitive information like API keys.
├── .gitignore              # Specifies files and folders to be ignored by Git.
├── package.json            # npm configuration file listing project dependencies and scripts.
└── README.md               # Documentation file containing information about the project.
```

## Getting Started

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Create a `.env` file and add your API key as follows:
   ```
   API_KEY=your_api_key_here
   ```
4. Install the necessary dependencies using npm:
   ```
   npm install
   ```
5. Open `public/index.html` in your web browser to view the application.

## Features

- Fetches and displays school meal information.
- Responsive design for optimal viewing on various devices.
- Detailed view of specific meals.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.