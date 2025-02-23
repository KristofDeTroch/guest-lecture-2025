# Guest Lecture 2025

This repository contains the code to illustrate the guest lecture on infrastructure as code. The supporting slide deck can be shared upon request.

## Goal of the lecture

Illustrate how IaC can be used to manage cloud infrastructure and how it can be leveraged to build resilient and scalable applications.

## Outline of the case study

### Stage 1: API only

The code starts with a simple API that handles a single endpiont and triggers an email if it is above a certain temperature.

### Stage 2: Extraction of the email service to a cloud function

To ensure reliability and scalability, the email service is extracted to a cloud function. This can scale separately from the API and is more resilient to failures.
It also "improves" the latency of the API and does not require waiting for the email to be sent.

### Stage 3: Adding a GCP alerting system

To ensure that the application is resilient and scalable, we add dead letter queues and alerting. These will alert us if the application is not behaving as expected.

### Bonus:

We also add a monitoring system to the application. This system will alert us if the application is not behaving as expected in a clearer way.
We use Sentry as a provider for this.
