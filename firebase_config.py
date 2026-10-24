########################################################
### This script connects to a Firestore database,    ###
### retrieves all documents from the 'newsletter_    ###
### subscribers' collection, and saves the data      ###
### (email, phone, timestamp) to a local JSON file.  ###
########################################################


import json
import os

# Path to your service account key JSON file
CRED_PATH = 'static/other/reconnectv2-d46d6-firebase-adminsdk-lbxc6-6c57cc8259.json'

# Firestore only serves the newsletter form. If the key file isn't there (e.g. a deploy
# from a machine without it), the site still starts and the newsletter form just
# answers with an error, instead of the whole app crashing at import time.
db = None
if os.path.exists(CRED_PATH):
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        firebase_admin.initialize_app(credentials.Certificate(CRED_PATH))
        db = firestore.client()
    except Exception as e:
        print(f"Firebase disabled: {e}")
else:
    print("Firebase disabled: key file not found; newsletter sign-ups are off.")



def download_subscribers():
    if db is None:
        print("Firebase is not configured (key file missing).")
        return
    try:
        collection_ref = db.collection('newsletter_subscribers')
        docs = collection_ref.stream()

        subscribers = []
        for doc in docs:
            data = doc.to_dict()
            subscribers.append({
                'email': data.get('email'),
                'phone': data.get('phone'),
                'timestamp': data.get('timestamp')
            })

        # Save to a JSON file
        with open('static/subscribers.json', 'w') as f:
            json.dump(subscribers, f, default=str, indent=4)  # Pretty print with 4 spaces
        print("Subscribers data saved to subscribers.json!")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    download_subscribers()
