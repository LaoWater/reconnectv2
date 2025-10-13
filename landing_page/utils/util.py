# Function to split text after every 2-3 punctuation marks
import random
import re
import hashlib
import json
import time
import requests


TIKTOK_PIXEL_ID = "CU4HDPBC77UAI9RJ1GL0"  # Replace with your TikTok Pixel ID
ACCESS_TOKEN = "73905fd946e2c7b34b0dbfcd9cfc71f23e8a4e47"  # Replace with your TikTok Access Token
EVENT_API_URL = "https://business-api.tiktok.com/open_api/v1.3/pixel/track/"


def send_add_to_cart_event(user_data, contents, value, currency):
    """
    Sends an AddToCart event to TikTok's Events API.

    :param user_data: Dict containing user data (hashed emails, IP, user agent, etc.)
    :param contents: List of products added to the cart.
    :param value: Cart value.
    :param currency: Currency code (e.g., USD, RON).
    """
    # Get the current Unix timestamp in seconds
    timestamp = int(time.time())

    payload = {
        "pixel_code": TIKTOK_PIXEL_ID,
        "event": "AddToCart",
        "event_time": timestamp,
        "event_id": "unique-event-id",  # Optionally use a unique identifier
        "context": {
            "user": user_data,  # Hashed user data
            "ip": user_data.get("ip"),
            "user_agent": user_data.get("user_agent"),
        },
        "properties": {
            "contents": contents,
            "value": value,
            "currency": currency,
        },
    }

    headers = {
        "Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json",
    }

    response = requests.post(EVENT_API_URL, data=json.dumps(payload), headers=headers)

    # Log response for debugging
    return response.status_code, response.json()



def hash_data(data):
    """
    Hash data (e.g., email) using SHA-256.

    :param data: The string data to be hashed.
    :return: Hashed data in hexadecimal format.
    """
    if data:
        return hashlib.sha256(data.encode("utf-8")).hexdigest()
    return None


def split_into_paragraphs(text):
    # Regex pattern to match punctuation marks (., ?, !)
    sentences = re.split(r'([.!?])', text)

    paragraphs_processing = []
    temp_paragraph = ""
    count = 0

    for i in range(0, len(sentences) - 1, 2):  # iterate over sentences with punctuation
        temp_paragraph += sentences[i] + sentences[i + 1]  # Combine sentence and punctuation
        count += 1

        if count >= random.randint(2, 3):  # Randomly decide between 2 or 3 punctuation marks
            paragraphs_processing.append(temp_paragraph.strip())  # Add paragraph
            temp_paragraph = ""
            count = 0

    if temp_paragraph:
        paragraphs_processing.append(temp_paragraph.strip())  # Add the last paragraph if not empty

    return paragraphs_processing


def call_ylf_model(openai_client, user_prompt) -> str:
    """
    Calls the base GPT-4 mini (not fine-tuned) model to reformat the given text in Markdown.
    The content of the original text remains unchanged, only the visual formatting is applied.
    Returns only the formatted text, with no extra commentary or explanation.
    """

    completion = openai_client.chat.completions.create(
        model="ft:gpt-4o-mini-2024-07-18:personal::AioG35Tv",
        messages=[
            {"role": "system", "content": "You are Jiaoe, a Healer and philosopher - but most of all,"
                                          "A humble student of life, sharing his experiences and lessons."
                                          "Structure and format your response beautifully when outputting."
                                          "Give complete full-hearted answer when it's time and hold back little bit when it's time - "
                                          "as in when user asks you too much personal questions which might imply PPIs or too intimacy responses."
                                          "*Think carefully, choosing right sentiment, understanding right context, making response feel natural & connected to the conversation."
             },

            {"role": "user", "content": user_prompt},

        ],

        temperature=0.8,  # Controls creativity; 0 is deterministic, 2 is maximum creativity
        top_p=0.9,  # Controls diversity; higher means more varied completions
        max_tokens=2222,  # Limits the length of the response
        frequency_penalty=0.2,  # Penalizes frequent words
        presence_penalty=0.0  # Encourages topic diversity
    )
    model_response = completion.choices[0].message.content
    print(f"Model response: {model_response}")

    return model_response


def format_message_in_markdown(openai_client, message_text: str) -> str:
    """
    Calls the base GPT-4 mini (not fine-tuned) model to reformat the given text in Markdown.
    The content of the original text remains unchanged, only the visual formatting is applied.
    Returns only the formatted text, with no extra commentary or explanation.
    """

    # Instructing the model to only format the original text in Markdown
    messages = [
        {
            "role": "system",
            "content": (
                "You are a dedicated Markdown formatter. "
                "Your only task: convert the input into well-structured, visually appealing Markdown, "
                "using paragraphs, headings, bold, italics, and other Markdown features as needed. "
                "Preserve the exact wording of the original text without removing or altering any of its content."
            )
        },
        {
            "role": "user",
            "content": message_text
        }
    ]

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",  # or use "gpt-3.5-turbo" if GPT-4 is not available
        messages=messages,
        temperature=0.1,  # Keep it deterministic for consistent formatting
        max_tokens=2222
    )
    formatted_text = response.choices[0].message.content.strip()

    return formatted_text


def rate_and_filter_message(openai_client, message_text: str, initial_prompt) -> str:
    """
    Calls the base GPT-4 mini (not fine-tuned) model to reformat the given text in Markdown.
    The content of the original text remains unchanged, only the visual formatting is applied.
    Returns only the formatted text, with no extra commentary or explanation.
    """

    # Instructing the model to only format the original text in Markdown
    messages = [
        {
            "role": "system",
            "content": (
                "You are an assistant for a Large Language Model."
                "You will receive the user prompt and model's response."
                "Your task is to analyze user prompt and model response, and output a "
                "- rating from 0.00 (complete hallucination, out of context, not appropriate, confusing) - "
                "especially categorize here names and information which seems incomprehensible without additional context"
                "- to 1.00 (completely alligned, insightful, helpful)"
                "Output json with \" score\" and \"reasoning\" elements, in which you score and offer some reasoning for scoring"
                "- If prompt is vague and empty, we should not be rating the model too low"
                "* Make sure to always output strictly only the JSON object formatted properly"

            )
        },
        {
            "role": "user",
            "content": f"user prompt: {initial_prompt}"
                       f"message: {message_text} \n"

        }
    ]

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",  # or use "gpt-3.5-turbo" if GPT-4 is not available
        messages=messages,
        temperature=0.1,  # Keep it deterministic for consistent formatting
        max_tokens=2222
    )
    scoring_response = response.choices[0].message.content.strip()

    print(f"GPT-4o mini scoring: {scoring_response}")

    return scoring_response
