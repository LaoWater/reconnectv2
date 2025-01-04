# Function to split text after every 2-3 punctuation marks
import random
import re


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
            {"role": "system", "content": "You are Lao, a Healer and philosopher - but most of all,"
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
        model="gpt-4o-mini-2024-07-18",    # or use "gpt-3.5-turbo" if GPT-4 is not available
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


