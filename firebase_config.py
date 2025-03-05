########################################################
### This script connects to a Firestore database,    ###
### retrieves all documents from the 'newsletter_    ###
### subscribers' collection, and saves the data      ###
### (email, phone, timestamp) to a local JSON file.  ###
########################################################


import firebase_admin
from firebase_admin import credentials, firestore
import json

# Path to your service account key JSON file
cred = credentials.Certificate('static/other/reconnectv2-d46d6-firebase-adminsdk-lbxc6-6c57cc8259.json')

# Initialize the app
firebase_admin.initialize_app(cred)

# Get Firestore database instance
db = firestore.client()



def download_subscribers():
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
