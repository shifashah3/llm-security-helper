# LLM Security Helper

LLM Security Helper is an educational security analysis tool that uses an open-source LLaMA model to identify vulnerabilities in both **source code** and **GenAI / agentic application specifications**. The project focuses on secure and responsible AI development practices.

---

## Overview

The tool provides two main security analysis modes:

### 1. Code Security Analysis
Analyzes code snippets to detect common vulnerabilities such as SQL injection, XSS, command injection, and insecure coding patterns. Each finding includes severity, explanation, and recommended fixes.

### 2. GenAI / Agentic Spec Analysis
Analyzes GenAI application specifications to identify risks such as prompt injection, excessive agency, insecure data access, and lack of human oversight. Findings are mapped to:
- OWASP Top 10 for LLM Applications
- MITRE ATLAS framework  
Each issue includes severity and mitigation guidance.

---

## Architecture

- **Frontend**: React (local development)
- **Backend**: Flask API (Google Colab)
- **Model**: LLaMA 3.2 3B (4-bit quantized)
- **Exposure**: ngrok (temporary public endpoints)

---



## Use Cases

* Learning secure coding practices
* Understanding GenAI and agentic AI risks
* Mapping real-world designs to OWASP and MITRE ATLAS
* Academic projects and assignments

---

## Disclaimer

This project is intended for **educational purposes only**. Results should be manually reviewed and should not be used as the sole basis for production security decisions.
