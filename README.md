# Flowdesk

An AI-powered workplace productivity assistant built for the CAPACITI AI Skills Acceleration Programme (ASA 10, JHB).

Flowdesk helps professionals cut down time spent on repetitive daily tasks by using generative AI to draft emails, plan workloads, and summarise information, all from a single clean interface.

## Project Overview

This project was built as part of CAPACITI's AI Skills Acceleration Programme, under the brief "AI-Powered Workplace Productivity Assistant." The goal was to design and build a practical AI solution that demonstrates effective use of AI tools, strong prompt engineering, and responsible AI practices.

## Problem Statement

Professionals spend significant time each week on repetitive tasks such as drafting emails, planning their workload, and researching information. This slows down productivity and takes focus away from higher value work. Flowdesk was built to directly reduce that daily overhead using AI.

## Features

Flowdesk includes three core features:

- **Smart Email Generator**: Generates a full professional email based on the purpose, recipient type (client, manager, recruiter), and tone (formal, informal, persuasive). Output is shown in an editable text box with a copy to clipboard option.
- **AI Task Planner**: Takes a raw list of tasks and deadlines and returns a structured, prioritised plan sorted by urgency and importance, with short reasoning for the order.
- **AI Research Assistant**: Takes a pasted article, job posting, or set of notes and returns a short summary along with 3 to 5 key insights or takeaways.

## Tools Used

- **Lovable** – AI app builder used to generate and deploy the front end from natural language prompts
- **React + Tailwind CSS** – Front end framework and styling
- **Gemini API (2.5 Flash)** – Language model powering the email, planning, and summarising features, routed securely via Lovable's AI Gateway
- **GitHub** – Version control, synced directly from Lovable

## Design

Flowdesk uses a light, warm interface by default, inspired by modern SaaS design patterns (Framer and Mobbin style layouts), with soft neutral backgrounds and a burnt orange accent colour. A light/dark mode toggle is available in the top right of the interface.

## Responsible AI

Flowdesk is designed to assist, not replace, human judgement:

- All AI generated content (emails, plans, summaries) is shown as editable text before use, nothing is sent or acted on automatically
- A visible disclaimer reminds users to review AI generated content before relying on it
- No personal or client data is stored, all processing happens per session
- Outputs are treated as a starting draft, since AI models can reflect bias in tone or phrasing

## Architecture

This project is front end only, as per the CAPACITI project brief. AI calls are handled through a secure edge function so no API key is exposed in the client.

## Presentation

A slide deck detailing the project, problem statement, and solution is included in this repository. You can download or view it here: [Flowdesk Presentation (PPTX)](./public/Flowdesk_CAPACITI_Presentation.pptx)

## Author

**Xabiso Memani**  
CAPACITI AI Skills Acceleration Programme, ASA 10, JHB
