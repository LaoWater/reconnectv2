import logging

from django.core.mail import send_mail
from django.http import HttpResponse, JsonResponse, HttpResponseForbidden
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
from openai import OpenAI
import os
from .models import CustomUser, Feedback, RLHFFeedback
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model

User = get_user_model()

from landing_page.utils.util import split_into_paragraphs, format_message_in_markdown, call_ylf_model, \
    rate_and_filter_message, send_add_to_cart_event, hash_data
from firebase_config import db


def index(request):
    return render(request, 'landing_page/index.html')  # Home Page


def index_en(request):
    return render(request, 'landing_page_en/index.html')  # Home Page



def coming_soon(request):
    return render(request, 'landing_page/coming_soon.html')  # Home Page


def contact(request):
    return render(request, 'landing_page/contact.html')  # Home Page


def bibliography(request):
    return render(request, 'landing_page/bibliography.html')  # Home Page


def send_email(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')

        if name and email and subject and message:
            try:
                full_message = f"Message from {name} ({email}):\n\n{message}"

                # Send email to lao.water7@gmail.com
                send_mail(
                    subject=subject,
                    message=full_message,
                    from_email=email,
                    recipient_list=['lao.water7@gmail.com'],
                    fail_silently=False,  # Will raise errors if email sending fails
                )

                return HttpResponse('Your message has been sent successfully!')
            except Exception as e:
                return HttpResponse(f'An error occurred: {e}')
        else:
            return HttpResponse('Please fill out all required fields.')
    else:
        return HttpResponse('Invalid request method.')


# @csrf_exempt  # Disable CSRF for simplicity (use caution in production)
def submit_newsletter(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request
            data = json.loads(request.body)
            email = data.get('email')
            phone = data.get('phone')

            # Validate the email and phone
            if not email:
                return JsonResponse({'error': 'Email is required'}, status=400)

            if phone and not phone.isdigit():
                return JsonResponse({'error': 'Phone must contain only numbers'}, status=400)

            # Check for duplicate email in Firestore
            existing_docs = db.collection('newsletter_subscribers').where('email', '==', email).stream()
            if any(existing_docs):
                return JsonResponse({'error': 'Email already subscribed'}, status=400)

            # Save data to Firestore
            doc_ref = db.collection('newsletter_subscribers').add({
                'email': email,
                'phone': phone if phone else None,
                'timestamp': datetime.now()
            })

            # Optional: Get the document ID for reference
            doc_id = doc_ref[1].id
            print(f"Data saved with Document ID: {doc_id}")

            # Send a success response
            return JsonResponse({'message': 'Submission successful', 'doc_id': doc_id})
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({'error': 'Something went wrong'}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)


##########################
### Deploying AI Model ###
##########################

def ylf_response(request):
    # Retrieve the API key from the environment variable
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        return JsonResponse({"error": "OPENAI_API_KEY is not set in the environment"}, status=500)

    # Initialize the OpenAI client with the API key
    client = OpenAI(api_key=api_key)

    prompt = None
    model_response = None

    if request.method == 'POST':
        # Check if the user is logged in
        username = None
        if request.user.is_authenticated:
            username = request.user.username

        prompt = request.POST.get('prompt')
        print(f"Received prompt: {prompt}")

        model_response, response_attempts = rate_and_store_responses(client, prompt)

        # Format the final response for output
        formatted_response = format_message_in_markdown(client, model_response)
        print(f"LLM parsed & formatted response: \n{formatted_response}")

        # Debug: Print all attempts and their scores
        print("All attempts and their scores:")
        for attempt in response_attempts:
            print(f"Response: {attempt['response']}\nScore: {attempt['score']}\n")

        ## Updating conv history as it gets generated from the view - but have some drawbacks, better to implement in JS
        # # If user is logged in, update their conversation history
        # if username:
        #     try:
        #         user = CustomUser.objects.get(username=username)
        #         # Append the new conversation to the user's conversation history
        #         conversation_history = user.conversation_history
        #         if "conversations" not in conversation_history:
        #             conversation_history["conversations"] = []
        #         conversation_history["conversations"].append({
        #             'prompt': prompt,
        #             'response': formatted_response
        #         })
        #         user.conversation_history = conversation_history
        #         user.save()
        #     except CustomUser.DoesNotExist:
        #         print(f"User {username} not found, skipping conversation history update.")

        # Prepare JSON response
        processed_json_response = JsonResponse({
            'paragraphs': [formatted_response],
            'username': username if username else None  # Include username only if logged in
        })

        return processed_json_response
    else:
        return render(request, 'landing_page/ylf.html')


def rate_and_store_responses(client, prompt, max_retries=3):
    """
    Call the model, rate the response, and retry up to max_retries times if the score is less than 0.5.
    Returns the highest scoring response if all scores are below 0.5.
    """
    responses = []  # Store responses with their scores
    highest_score = 0
    best_response = None

    for attempt in range(max_retries):
        model_response = call_ylf_model(client, prompt)  # Get model response
        response_scoring = rate_and_filter_message(client, model_response, prompt)  # Rate the response

        # Ensure response_scoring is parsed as JSON
        if isinstance(response_scoring, str):
            try:
                response_scoring = json.loads(response_scoring)
            except json.JSONDecodeError:
                print(f"Error parsing JSON: {response_scoring}")
                response_scoring = {"score": 0, "reasoning": "Invalid JSON format."}

        score = response_scoring.get("score", 0)  # Extract the score from the JSON

        # Store the response and its score
        responses.append({"response": model_response, "score": score})
        print(f"Attempt {attempt + 1}: Response Score: {score}")

        # Update the best response if this one is higher
        if score > highest_score:
            highest_score = score
            best_response = model_response

        # Exit loop early if the score is acceptable
        if score >= 0.5:
            print("Acceptable response found, exiting retry loop.")
            return model_response, responses

    # If no acceptable score, return the highest scoring response
    print("No acceptable response found, returning the highest scoring response.")
    return best_response, responses


def react_food_prophet(request):
    return render(request, 'react_food_prophet.html')


@csrf_exempt
def save_conversation_history(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data sent from the frontend
            data = json.loads(request.body)

            # Check if a username is provided
            username = data.get('username')
            conversations = data.get('conversations')

            if not conversations:
                return JsonResponse({"error": "Conversations data is required"}, status=400)

            # Handle logged-in or anonymous user
            if username:
                try:
                    user = CustomUser.objects.get(username=username)
                except CustomUser.DoesNotExist:
                    return JsonResponse({"error": f"User {username} does not exist"}, status=404)
            else:
                # Use a default 'anonymous_user' for non-logged-in users
                user, _ = CustomUser.objects.get_or_create(username="anonymous_user")

            # Update the conversation history
            user.conversation_history = {"conversations": conversations}
            user.save()

            return JsonResponse({"message": "Conversation history saved successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid HTTP method"}, status=405)


def get_user_data(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            try:
                user = CustomUser.objects.get(username=request.user.username)
                # Parse conversation_history if it's a string
                try:
                    conversation_history = json.loads(user.conversation_history) if isinstance(
                        user.conversation_history, str) else user.conversation_history
                except json.JSONDecodeError:
                    conversation_history = {"conversations": []}  # Fallback in case of JSON parsing issues

                return JsonResponse({
                    "username": user.username,
                    "conversations": conversation_history.get('conversations', [])
                })
            except CustomUser.DoesNotExist:
                return JsonResponse({"error": "User not found"}, status=404)
        else:
            return JsonResponse({
                "username": None,
                "conversations": []
            })
    else:
        return JsonResponse({"error": "Invalid HTTP method"}, status=405)


logger = logging.getLogger('django')


def ajax_login(request):
    logger.debug("Received request for ajax_login")
    if request.method == 'POST':
        logger.debug("Request method is POST")
        username = request.POST.get('username')
        password = request.POST.get('password')
        logger.debug(f"Username: {username}, Password: {password}")

        user = authenticate(request, username=username, password=password)
        if user:
            logger.debug("User authenticated successfully")
            login(request, user)
            return JsonResponse({'success': True, 'message': 'Login successful'})
        logger.warning("Authentication failed for user")
        return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=400)
    logger.warning("Invalid request method")
    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


def ajax_register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if password1 != password2:
            return JsonResponse({'success': False, 'message': 'Passwords do not match'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'message': 'Username already taken'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password1)
        user.save()
        return JsonResponse({'success': True, 'message': 'Registration successful'})
    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


def ajax_logout(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True, 'message': 'Logged out successfully'})
    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


def check_login_status(request):
    print(f"User authenticated: {request.user.is_authenticated}")
    if request.user.is_authenticated:
        return JsonResponse({'logged_in': True, 'username': request.user.username})
    return JsonResponse({'logged_in': False})


def export_database(request):
    # Security: Require a secret key in the request
    secret_key = request.GET.get('secret_key')
    env_secret_key = os.getenv("SECRET_KEY_DB_EXPORT", None)
    if secret_key != env_secret_key:  # Replace with your actual key
        return HttpResponseForbidden("Unauthorized access.")

    # Path to the database file
    if os.getenv('GAE_ENV', '').startswith('standard'):  # Cloud environment
        db_path = '/tmp/db.sqlite3'
    else:  # Local development
        db_path = os.path.join(os.path.dirname(__file__), '../db.sqlite3')  # Adjust for your local structure

    # Ensure the file exists
    if not os.path.exists(db_path):
        return HttpResponse("Database file not found.", status=404)

    # Serve the file as a response
    with open(db_path, 'rb') as db_file:
        response = HttpResponse(db_file.read(), content_type='application/x-sqlite3')
        response['Content-Disposition'] = 'attachment; filename="db.sqlite3"'
        return response


# Mobile Debugging Scroll Behavior

def log_scroll(request):
    if request.method == 'POST':
        try:
            import json
            data = json.loads(request.body)
            scroll_top = data.get('scrollTop', 'Unknown')
            threshold = data.get('threshold', 'Unknown')

            # Log the data to the console
            # logger.info(f"Scroll Top: {scroll_top}, Threshold: {threshold}")
            # print(f"Scroll Top: {scroll_top}, Threshold: {threshold}")  # For direct console output

            return JsonResponse({'status': 'success', 'scrollTop': scroll_top, 'threshold': threshold})
        except Exception as e:
            logger.error(f"Error processing scroll data: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request'}, status=400)


# Tik-Tok advertising server side events Pixel setup


def add_to_cart_server_event(request):
    if request.method == "POST":
        # Extract user and cart details from the request
        user_email = request.POST.get("email")  # Get user email
        user_ip = request.META.get("REMOTE_ADDR")  # Get user IP address
        user_agent = request.META.get("HTTP_USER_AGENT")  # Get user agent

        # Hash user email
        hashed_email = hash_data(user_email)

        # Prepare TikTok server-side event data
        user_data = {
            "email": hashed_email,
            "ip": user_ip,
            "user_agent": user_agent,
        }

        contents = [
            {
                "content_id": "reconnect_course_v2",
                "content_type": "product",
                "content_name": "Reconnect V2 Course",
            }
        ]

        value = 377  # Cart value
        currency = "RON"  # Currency code

        # Send event to TikTok
        status_code, response = send_add_to_cart_event(user_data, contents, value, currency)

        # Return the response as JSON
        return JsonResponse({"status_code": status_code, "response": response})

    return JsonResponse({"error": "Invalid request method"}, status=400)


# Storing YLF Model user feedbacks

def store_feedback(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = request.user if request.user.is_authenticated else None
            prompt = data.get('prompt', '')
            response = data.get('response', '')

            feedback = Feedback.objects.create(
                user=user,
                prompt=prompt,
                response=response,
            )
            return JsonResponse({'message': 'Feedback stored successfully!'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method.'}, status=405)


def submit_rlhf_feedback(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            user = request.user if request.user.is_authenticated else None
            prompt = data.get('prompt', '').strip()
            response = data.get('response', '').strip()
            feedback_details = data.get('feedback', {})

            # Check for missing fields
            required_fields = [
                "I. Completeness",
                "II. Accuracy",
                "III. Instruction Following",
                "IV. Contextual Awareness",
                "V. Writing & Tonality Quality",
                "VI. Creativity",
                "VII. Overall Final Score",
            ]

            missing_fields = [field for field in required_fields if field not in feedback_details]
            if missing_fields:
                return JsonResponse({'error': f"Missing feedback fields: {', '.join(missing_fields)}"}, status=400)

            # Create RLHF_Feedback object
            RLHFFeedback.objects.create(
                user=user,
                prompt=prompt,
                response=response,
                completeness_rating=int(feedback_details.get('I. Completeness', {}).get('rating', 0)),
                completeness_justification=feedback_details.get('I. Completeness', {}).get('justification', ''),
                accuracy_rating=int(feedback_details.get('II. Accuracy', {}).get('rating', 0)),
                accuracy_justification=feedback_details.get('II. Accuracy', {}).get('justification', ''),
                instruction_following_rating=int(
                    feedback_details.get('III. Instruction Following', {}).get('rating', 0)),
                instruction_following_justification=feedback_details.get('III. Instruction Following', {}).get(
                    'justification', ''),
                contextual_awareness_rating=int(feedback_details.get('IV. Contextual Awareness', {}).get('rating', 0)),
                contextual_awareness_justification=feedback_details.get('IV. Contextual Awareness', {}).get(
                    'justification', ''),
                writing_quality_rating=int(feedback_details.get('V. Writing & Tonality Quality', {}).get('rating', 0)),
                writing_quality_justification=feedback_details.get('V. Writing & Tonality Quality', {}).get(
                    'justification', ''),
                creativity_rating=int(feedback_details.get('VI. Creativity', {}).get('rating', 0)),
                creativity_justification=feedback_details.get('VI. Creativity', {}).get('justification', ''),
                final_score=int(feedback_details.get('VII. Overall Final Score', {}).get('rating', 0)),
                final_score_justification=feedback_details.get('VII. Overall Final Score', {}).get('justification', ''),
            )

            return JsonResponse({'message': 'RLHF Feedback stored successfully!'}, status=201)

        except KeyError as e:
            return JsonResponse({'error': f"Missing key: {str(e)}"}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)
