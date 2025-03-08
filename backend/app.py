from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from pymongo import MongoClient
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_md")
except OSError:
    print("spaCy model not found. Please run: python -m spacy download en_core_web_md")
    exit(1)

# MongoDB connection
def connectDB():
    try:
        client = MongoClient("mongodb+srv://the_umersaiyad:Umer2003@cluster0.dktji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client["test"]
        return db["ipcsections"]  # Corrected collection name (removed space)
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

@app.post("/suggest")
def suggest_sections():
    data = request.get_json()
    description = data.get("description")
    if not description:
        return jsonify({"error": "Description is required"}), 400

    try:
        collection = connectDB()
        sections = list(collection.find())  # Fetch all IPC sections from MongoDB

        if not sections:
            return jsonify({"error": "No IPC sections found in database"}), 404

        # Process the complaint description
        desc_doc = nlp(description.lower())

        # Calculate similarity and prepare suggestions
        ipc_suggestions = []
        for section in sections:
            section_desc = nlp(section["description"].lower())
            similarity = desc_doc.similarity(section_desc) * 100  # Convert to percentage
            if similarity > 50:  # Threshold to filter relevant suggestions
                ipc_suggestions.append({
                    "section": section["section"],
                    "description": section["description"],
                    "match_percentage": round(similarity, 2)
                })

        # Sort by match percentage in descending order and limit to top 5
        ipc_suggestions = sorted(ipc_suggestions, key=lambda x: x["match_percentage"], reverse=True)[:5]

        return jsonify({
            "ipc_suggestions": ipc_suggestions,
            "legal_suggestions": [
                {"suggestion": "Consider gathering more witness statements", "match_percentage": 85},
                {"suggestion": "Ensure evidence is admissible in court", "match_percentage": 70}
            ]
        })
    except Exception as e:
        traceback.print_exc()  # Print full stack trace for debugging
        return jsonify({"error": f"Failed to suggest sections: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)