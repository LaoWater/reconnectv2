<p align="center">
  <a href="https://reconnectv2.com">
    <img src="landing_page/static/images/logo.png" width="200" alt="Re-Connect Logo">
  </a>
<br>
<a href="https://github.com/LaoWater/reconnectv2"><img src="https://img.shields.io/github/stars/LaoWater/reconnectv2?style=social" alt="GitHub stars - Re-Connect V2" /></a>
<a href="https://github.com/LaoWater/reconnectv2/blob/main/LICENSE">
<img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" />
</a>
<br>
<a href=""><img src="https://img.shields.io/badge/built_with-Python,_Django,_React-blue.svg?logo=react" /></a>
&nbsp;
<a href="https://twitter.com/Re-Connect"><img src="https://img.shields.io/twitter/follow/Re-Connect?style=social" alt="Follow on Twitter" /></a>
</p>

---

### <u>Project Overview</u>

**Re-Connect** is a **full-stack web application** built with a powerful combination of modern technologies:

- **React**: Provides a fast, responsive, and interactive front-end experience.
- **Python ML Scripts**: Powers intelligent and data-driven backend features.
- **Django**: Robust backend framework to ensure scalability and reliability.
- **JavaScript, CSS, and Tailwind**: Delivers a polished, smooth, and consistent user interface.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Main Components](#main-components)
  - [I. Online Course Landing Page](#i-online-course-landing-page)
  - [II. Project YLF](#ii-project-ylf)
  - [III. Food Prophet](#iii-food-prophet)
  - [IV. Bibliography](#iv-bibliography)
- [Installation and Deployment Guide](#installation-and-deployment-guide)
- [Contributions](#contributing)

---

### Key Features
1. **Cost-Effective Hosting**  
   - Designed to help start-ups **host a full web application** with **minimal cost** while maintaining great performance.

2. **Performance-Oriented Architecture**  
   - Combines **SQLite database exchange and syncing** with **Google and environment secrets** for secure data handling.  
   - Optimized for **small-scale production apps**.

3. **Future-Ready Scalability**  
   - Built to **prepare for growth**, ensuring seamless scaling as demand for users and computational resources increases.

4. **Responsive Design**  
   - A **friendly UI** that provides a smooth experience on both desktop and mobile devices.

---

### Visit the Website
[![Visit Re-Connect V2](https://img.shields.io/badge/Website-Re--ConnectV2-blue?style=for-the-badge&logo=react)](https://reconnectv2.com)

---

# Main Components

## I. Online Course Landing Page

### The Secrets of Alchemy

Online Course Landing Page, available in both Romanian and English versions, showcases a harmonious blend of self-crafted CSS and JavaScript animations. 
By leveraging modern libraries such as Animate.css and GSAP, we've tailored these animations to align seamlessly with the website's theme, providing users with an engaging and immersive experience.

---


## II. Project YLF

Starting point: **Stand-Alone Python trained Large Language Model** [Project YLF](https://github.com/LaoWater/LLM-Create-Process-Train).  

### Explore the full project on
[![GitHub Repository](https://img.shields.io/badge/Repository-Visit-blue?logo=github)](https://github.com/LaoWater/LLM-Create-Process-Train)

This app has been **integrated** into the Web App's framework to align with **business needs and context**.

---

### Key Features
1. **LLM Integration**  
   - **Dataset**: Trained on the company's processed dataset.  
   - **Multi-Agent Orchestration Pipeline**: Designed for **rating** and **processing** model responses.
   
2. **Architecture**  
   - **Trained Model**:
     - Receives a prompt and generates an answer.
   - **First-Layer LLM**:
     - Rates the model's answers based on:
       - **Safety**
       - **Context Awareness**
       - **Helping Sentiment**
     - If scoring is below the threshold, it calls the YLF model again, repeating the process until the **threshold is met** or the **attempt limit is reached**.
   - **Second-Layer LLM**:
     - Performs a **final review** and applies **Markdown formatting** to the response.

3. **User-Friendly Design**  
   - A **smooth and responsive UI** for both PC and mobile platforms.

4. **RLHF (Reinforcement Learning with Human Feedback) Integration**  
   - **Feedback Workflow**:
     - Each response can be flagged as **inappropriate** or **unsatisfactory**.
     - Users have the option to provide **complex feedback** via a multi-Dimensions Rating workflow. This feedback is collected & stored - used for RLHF in future model iterations.

---


## III. Food Prophet
### Stand-Alone React Application

**Food Prophet** is a **stand-alone React application** integrated within this Django Project. 
It uses a probabilistic digestion simulation model to visually represent archetype-based patterns on an interactive graph.

### Repository Link
[![GitHub Repository](https://img.shields.io/badge/Repository-Visit-blue?logo=github)](https://github.com/LaoWater/The_Food_Prophet)

---

### Features
- **Archetype Simulation**: Simulates digestion for predefined or custom archetypes using probabilistic models.
- **Interactive Graph**: Real-time updates with meal additions and adjustable simulation speed.
- **Async Web Worker Integration**: Offloads heavy computations to ensure smooth performance.

---

## IV. Bibliography

### Overview

The **Bibliography** section offers a curated collection of influential works that explore the intricate connections between the body, mind, and nature. This compilation serves as a resource for those seeking to deepen their understanding of holistic well-being and personal transformation.

> [!NOTE]
> The summaries are carefully crafted from personal experiences and reflections on each work.

For a comprehensive list and detailed insights, please visit [Bibliography Page](https://reconnectv2.com/bibliography/).

---

## **Installation and Deployment Guide**

**1. Install Requirements**

```bash
pip install -r requirements.txt
```

**2. Environment Variables**

Set up the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key.
- `SECRET_KEY_DB_EXPORT`: Secret key for fetching the database from cloud. 
- `EMAIL_HOST_USER`: Email address for Django's email exchange.
- `EMAIL_HOST_PASSWORD`: Password for the above email address.
- `GOOGLE_CLIENT_SECRET`: Google Login OAuth Credentials
- `GOOGLE_CLIENT_ID`: Google Login OAuth Credentials

**For Local Development:**

With the environment variables configured, you're ready to proceed with local development.

---

**3. Deployment Requirements**

The current architecture deploys the app on Google Cloud App Engine, utilizes Firebase for storing user model data, and includes an internal pipeline for synchronizing databases. 
This setup ensures a safe and smooth user experience suitable for low to medium scaling. As the application grows, consider transitioning to a server-side database for enhanced performance.

**Key Deployment Files:**

- `app.yaml`: Configuration file for Google App Engine deployment. Load the necessary environment variables here or set them up using Google Secrets.
- `entrypoint` Scripts: These scripts run upon deployment. In the current framework of continuous SQLite deployment and synchronization, we use `./startup.sh` to sync the databases and start the web app using Gunicorn.

**Deployment Steps:**

1. **Set Up Google Cloud Project:**

   - Create a new project in the [Google Cloud Console](https://console.cloud.google.com/).
   - Enable the App Engine and related APIs.

2. **Configure `app.yaml`:**

   ```yaml
   runtime: python39
   entrypoint: ./startup.sh
   ...
    ```
   
3. **Deploy the Application:**

   ```bash
   gcloud app deploy
   ```

   For a detailed walkthrough, refer to this [tutorial on deploying a Django app to Google App Engine](https://testdriven.io/blog/django-gae/).

**Note:** Ensure that all environment variables are securely managed.

---

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

We welcome contributions! Check out the [Contributing Guidelines](CONTRIBUTING.md).

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).


