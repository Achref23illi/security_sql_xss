// File: SETUP.md
# Database Security Project Setup Guide

This guide will walk you through setting up the Database Security Project from scratch.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [XAMPP](https://www.apachefriends.org/download.html) for MySQL database

## Step 1: Install XAMPP

1. Download and install XAMPP from [https://www.apachefriends.org/download.html](https://www.apachefriends.org/download.html)
2. Start XAMPP Control Panel
3. Start the Apache and MySQL services by clicking the "Start" buttons

## Step 2: Configure MySQL Database

1. Open your browser and go to [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/)
2. The default username is "root" with no password

## Step 3: Install Project Dependencies

Run the following command in the project root directory:

```bash
npm run install-all