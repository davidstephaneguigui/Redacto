# 📰 Redacto

**Redacto** is a comprehensive business web application designed to manage the entire lifecycle of a newspaper: from drafting articles to final layout, including proofreading, validation, and composition.

## 🎯 Project Objective

The objective of Redacto is to provide a centralized platform for an editorial team, allowing them to:
- Manage roles (Writers, Editors, Administrators).
- Track article progress (versions, proofreading, validations).
- Compose the newspaper (Page plan, assigning articles to pages).
- Export data for layout (InDesign).

## 🚀 Key Features

- **Drafting**: Article creation with version control, image management, and drafts.
- **Proofreading**: Annotation system with diff calculation and dual validation.
- **Composition**: An interactive "Page plan" (Chemin de fer) to place articles on pages, manage order, double-page spreads, and real-time character counters.
- **Layout**: Export composed pages to InDesign in IDML format (via the `simple_idml` library).
- **Issue Management**: Dashboard for issues (in progress, on hold, archived) with year-based navigation.
- **Responsive**: Interface adapted for desktops, tablets, and smartphones (burger menu, tables as cards).

## 🏗️ Architecture (Django Apps)

The project is divided into several applications, each with a single responsibility (Single Responsibility Principle - SRP):

- `accounts`: User and role management.
- `articles`: Lifecycle of articles and their versions.
- `reviews`: Proofreading and annotation process.
- `publications`: Newspaper composition (Pages, Sections, Issues, Page plan).
- `display`: Layout and exports (IDML, LaTeX).
- `core`: Cross-cutting features (Notifications, home page).

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, Django 5+
- **Database**: SQLite (development)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Notable Libraries**:
  - `Pillow` (image management)
  - `WeasyPrint` (PDF generation for proofreading)
  - `simple_idml` (InDesign export)

## ⚙️ Local Installation and Launch

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-name/Redacto.git
    cd Redacto
    ```

2. **Create and activate a virtual environment**:
    ```bash
    python -m venv .venv
    # On Windows:
    .venv\Scripts\activate
    # On macOS/Linux:
    source .venv/bin/activate
    ```

3. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Apply migrations**:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

5. **Run the development server**:
    ```bash
    python manage.py runserver
    ```

6. **Access the site**:
    Open your browser and go to [http://127.0.0.1:8000/](http://127.0.0.1:8000/).