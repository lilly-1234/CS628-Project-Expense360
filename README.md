# CS628-Project-Expense360

Expense 360 is a MERN based personal finance management application which helps users to track their expenses, categorize transactions, analyze spendings, and manage multiple accounts. This application features a user-friendly dashboard with interactive graphs and charts to analyze spending trends. Additionally, it integrates the Gemma 2B chatbot via Ollama to provide financial insights and assist users with queries.

## Input
Users can input the login Credentials (Email & Password) for authentication. Expense Transactions includes inputs such as date, transaction name, category (e.g., Entertainment, Groceries, Transport, Dining, Shopping, etc.), amount, and account Details (Debit & Credit Cards linked to users).

## Features:
- User Authentication & Dashboard - Secure Login & Signup system with authentication, dashboard displaying an overview of expenses.Transactions & Categorization 
- Transactions & Categorization - Users can  update transactions and categorized for easy tracking.
- Graphical Analysis & Reports - Charts displaying spending trends and downloadable time-frame transactions
- Account Management - Users can manage multiple accounts, including Debit Cards, Credit Cards, Linked Bank Accounts
- AI-Powered Chatbot - Integrated Ollama-powered chatbot to provide financial assistance, users can ask queries about budgeting, spending habits, and financial tips.

## Process
The Expense 360 application follows a structured workflow to ensure seamless financial tracking. Users begin by logging into the system through the React frontend, which then sends an authentication request to the Express.js backend. Upon successful verification the dashboard displays an overview of total spending, recent transactions, and account balances. Users can update transactions, which are categorized for easy tracking and stored in MongoDB. These transactions are visually represented using recharts graphs, providing a clear understanding of spending trends. Additionally, users can manage their linked accounts, including debit and credit cards, ensuring efficient financial oversight. The application also integrates the Gemma 2B chatbot via Ollama, allowing users to ask financial questions and receive insights.

## Output
After successful login, users would be able to see a dashboard displaying their total expenses, recent transactions, and linked accounts and charts providing a visual breakdown of spending trends. A transaction management system allows users to update transactions with categorized spending reports to help users understand their financial habits. A Gemma 2B AI chatbot via Ollama is available to answer financial queries.
