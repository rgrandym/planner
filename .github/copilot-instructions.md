# Project Intelligence & Master Rules

**Rule #1:** These instructions are MANDATORY for all tasks including refactoring, feature addition, bug fixing, and scaffolding. Before responding, verify that your proposed code does not violate any constraint below.

## 🛠 Environment & Dependency Management

- **Conda Detection:** Always check for `environment.yml`. Identify the environment name from the `name:` field.
- **Dependency Sync:** Use dependencies from both `environment.yml` and `requirements.txt`.
- **Persistence:** When adding a dependency, update **both** files. Ensure the environment remains functional.
- **Missing Env:** If no environment is found, ask: "Which Conda env should I use?" Update this file with `**Active Env:** [name]` once confirmed.

## 📂 Standard Directory Structure

Every new project or modification must strictly adhere to this folder hierarchy. Do not place files in the root directory unless they are configuration files (e.g., `.gitignore`, `README.md`).

- **`.github/`**: CI/CD workflows, GitHub Actions, and Copilot instruction files.
- **`src/`**: All production-ready modular Python code. Sub-folders should reflect modules.
- **`config/`**: YAML, TOML, or JSON configuration files. No hardcoded credentials.
- **`data/`**:
  - `raw/`: Immutable original data.
  - `processed/`: Cleaned data ready for modeling.
- **`notebooks/`**: Jupyter notebooks for EDA and prototyping. Use `01_name.ipynb` numbering.
- **`research/`**: External papers, reference PDFs, and experimental notes.
- **`docs/`**: Project documentation, API references, and architecture diagrams.
- **`logs/`**: Standard location for runtime log files.

## 🏗 Architectural Rules (Modularity)

- **Class Design:** Strictly follow the Single Responsibility Principle.
- **Method Length:** Functions/methods must be **no longer than 100 lines**.
- **Refactoring:** If you are asked to "fix" or "refactor" code, your first priority is ensuring methods are modular and under 100 lines.
- **File Placement:** Logic belongs in `src/`, experiments belong in `notebooks/`, and reference notes belong in `research/`.

## 🐍 Python Coding Standards (PEP 8)

- **Style:** Strictly follow PEP 8. Use 4 spaces for indentation.
- **Naming:** `PascalCase` for classes; `snake_case` for functions/variables.
- **Type Hints:** Mandatory for all function signatures (parameters and return types).
- **Documentation:** Use Google-style or ReStructuredText docstrings for all public methods.

## 🧩 Style Consistency & Pattern Matching

- **Observation First:** Before writing or refactoring, analyze the surrounding code and existing files in the module.
- **Mirroring:** Match the existing naming patterns, architectural layers, and library usage even if they differ from your internal defaults.
- **Project Context:** If a pattern is established in `src/` (e.g., a specific way of handling errors or logging), you MUST replicate that pattern in all new code for that module.
- **Conflict Resolution:** If a project-specific style conflicts with PEP 8, prioritize project consistency but add a `# TODO: refactor to PEP 8` comment.

## ⌨️ Command Triggers

- **Trigger:** "new project" or "scaffold project"
- **Action:** 1. Create the directory structure defined in the "Standard Directory Structure" section.
  2. Create an initial `environment.yml` and `requirements.txt` based on the project type.
  3. Initialize a `.gitignore` file for Python.
  4. Ensure a `README.md` is created in the root.

## 🚫 Constraints

- **Tests:** Do **NOT** create test files or folders unless explicitly asked.
- **Readability:** Prioritize clarity over "clever" code. Avoid deep nesting.

---

*Scope: Applies to all files in this workspace.*
