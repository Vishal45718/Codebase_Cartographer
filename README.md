# Codebase Cartographer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)

A powerful web application that visualizes the architecture and dependencies of software projects by analyzing their source code. Built for developers, architects, and teams who need to understand complex codebases at a glance.

##  Overview

In today's fast-paced development environment, understanding the structure and dependencies of large codebases can be challenging. Codebase Cartographer addresses this by providing an intuitive, interactive visualization tool that transforms GitHub repositories into clear dependency graphs. Whether you're onboarding new team members, conducting code reviews, or planning refactoring efforts, our tool helps you navigate and comprehend code relationships instantly.

**Key Problem Solved:** Manual code analysis is time-consuming and error-prone. Codebase Cartographer automates the discovery of architectural patterns, import relationships, and structural insights, reducing analysis time from hours to minutes.

##  Key Features

- **Automated Repository Analysis**: Input any GitHub repository URL and get instant architectural insights
- **Multi-Language Support**: Parses Python, JavaScript, and TypeScript codebases with high accuracy
- **Interactive Graph Visualisation**: Explore dependencies through an intuitive force-directed graph interface
- **Real-time Processing**: Fast analysis powered by efficient parsing and graph algorithms
- **Responsive Design**: Clean, modern UI that works seamlessly across devices
- **RESTful API**: Extensible backend for integration with other tools

##  Tech Stack

### Backend
- **FastAPI**: High-performance async web framework for Python
- **Tree-sitter**: Advanced parsing library for accurate syntax analysis
- **NetworkX**: Graph creation and manipulation library
- **GitPython**: Git repository handling
- **Uvicorn**: ASGI server for production deployment

### Frontend
- **React 19**: Modern JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Force Graph 2D**: Interactive graph visualization component
- **Axios**: HTTP client for API communication

##  Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

##  Usage

### Running the Application
1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   ```
   The API will be available at `http://localhost:8000`

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Analysing a Repository
1. Open the application in your browser
2. Enter a GitHub repository URL (e.g., `https://github.com/microsoft/vscode`)
3. Click "Analyse" to generate the dependency graph
4. Interact with the graph:
   - **Zoom**: Mouse wheel or pinch gestures
   - **Pan**: Click and drag
   - **Node Details**: Hover over nodes to see file/function information
   - **Fit to View**: Use the zoom-to-fit button

### Example Output
For a typical React project, the graph might show:
- **Nodes**: Individual files, classes, and functions
- **Links**: Import relationships and dependencies
- **Colours**: Different node types (files, classes, functions) for easy identification

##  Project Structure

```
codebase-cartographer/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── requirements.txt     # Python dependencies
│   ├── core/
│   │   ├── downloader.py    # Git repository cloning and file discovery
│   │   ├── parser.py        # Tree-sitter-based code parsing
│   │   └── graph_builder.py # Dependency graph construction
│   └── test_parser.py       # Unit tests for parsing functionality
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── App.jsx          # Main React application component
│   │   ├── main.jsx         # React application entry point
│   │   ├── components/
│   │   │   └── GraphViewer.jsx  # Interactive graph visualization
│   │   └── assets/          # Application assets
│   ├── package.json         # Node.js dependencies and scripts
│   └── vite.config.js       # Vite configuration
└── README.md                # Project documentation
```

## 🏗 Architecture & Design Decisions

### Parser Selection
We chose Tree-sitter over traditional regex-based parsing for its superior accuracy in handling complex language syntax. This decision ensures reliable dependency extraction even in edge cases like dynamic imports or conditional statements.

### Graph Representation
Using NetworkX for backend graph construction provides robust algorithms for graph analysis, while react-force-graph-2d delivers smooth, interactive visualisations. This separation allows for future enhancements like different layout algorithms or export formats.

### API Design
The RESTful API design with Pydantic models ensures type safety and automatic validation, reducing runtime errors and improving maintainability.

## 🗺 Future Roadmap

- **Enhanced Language Support**: Add parsers for Java, Go, Rust, and C++
- **Advanced Analytics**: Implement complexity metrics, circular dependency detection, and architectural pattern recognition
- **Collaboration Features**: Real-time shared viewing and commenting on graphs
- **Export Options**: Support for SVG, PNG, and GraphML exports
- **Integration APIs**: Webhooks for CI/CD pipeline integration
- **Performance Optimisation**: Implement caching and incremental analysis for large repositories

##  Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the developer community**