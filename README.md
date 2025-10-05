# Welcome to your CineLingo project

## Project info

**URL**: https://lovable.dev/projects/6fb5ef87-507e-4fb3-b7c3-d15b51f23c10  

**Description**:  
CineLingo is an AI-powered multilingual subtitle generation platform that automatically produces accurate subtitles for videos in multiple languages using advanced speech processing and translation APIs.

---

## How can I edit this code?

There are several ways of editing your application.

### Use Lovable
Simply visit the [CineLingo Project](https://lovable.dev/projects/6fb5ef87-507e-4fb3-b7c3-d15b51f23c10) and start prompting.  
Changes made via Lovable will be committed automatically to this repo.

---

### Use your preferred IDE

If you want to work locally using your own IDE, you can clone this repo and push changes.  
Pushed changes will also be reflected in Lovable.

The only requirement is having **Python 3.8+** and **pip** installed.

Follow these steps:

```bash
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/Codesphere2003/SUBTITILELATEST.git

# Step 2: Navigate to the project directory.
cd SUBTITILELATEST

# Step 3: Install the necessary dependencies.
pip install -r requirements.txt

# Step 4: Run the application.
python main.py
Once the server starts, open your browser and go to:
http://127.0.0.1:5000

Edit a file directly in GitHub
Navigate to the desired file(s).

Click the Edit button (pencil icon) at the top right of the file view.

Make your changes and commit the changes.

Use GitHub Codespaces
Navigate to the main page of your repository.

Click on the Code button (green button) near the top right.

Select the Codespaces tab.

Click New codespace to launch a new environment.

Edit files directly within the Codespace, then commit and push once you're done.

What technologies are used for this project?
This project is built with:

Python (Flask Framework)

OpenAI Whisper / Google Speech-to-Text API

Google Translate / DeepL API

HTML, CSS, JavaScript (Frontend)

FFmpeg for audio extraction

Pytest for testing

How can I deploy this project?
You can deploy CineLingo on cloud or containerized environments such as Render, Heroku, or AWS.

Example deployment command:

bash
Copy code
gunicorn main:app
If you are using Lovable, simply open
Lovable
and click on Share → Publish to deploy your app instantly.

Can I connect a custom domain to my Lovable project?
Yes, you can!

To connect a domain, navigate to Project → Settings → Domains and click Connect Domain.
Learn more here: Setting up a custom domain

Environment Variables
Create a .env file in your project root with the following variables:

ini
Copy code
API_KEY=<your_speech_to_text_api_key>
TRANSLATION_API_KEY=<your_translation_api_key>
OUTPUT_DIR=outputs/
Team Members
Name	Role	Contact
Adithyaa S Kumar	Backend & UI Developer	GitHub
Gomathy Krishna Binu	Speech Processing	GitHub
Vigil Das P S	API Integration	GitHub
Aswin Suresh Kumar	Backend Developer	GitHub

Known Limitations / TODOs
Processing large video files may take longer.

Requires active API connectivity (limited offline use).

Expand support for more regional languages.

Add noise reduction and emotion-based subtitle tone features.

License
This project is licensed under the GNU General Public License v3.0.
See the LICENSE file for details.

Attributions
OpenAI Whisper / Google Speech-to-Text for transcription

DeepL / Google Translate for translation

Flask framework for backend development
