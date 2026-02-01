# Using AI Tools with JobFit

This document explains how to get the best AI-assisted development experience with the JobFit project.

## GitHub Copilot in VS Code

### Initial Setup

1. **Install Required Extensions**
   - Open VS Code in this workspace
   - You'll see a prompt to install recommended extensions
   - Click "Install All" or install these manually:
     - `GitHub.copilot` - AI code suggestions
     - `GitHub.copilot-chat` - Chat interface with AI

2. **Sign in to GitHub Copilot**
   - Click the GitHub Copilot icon in the status bar
   - Sign in with your GitHub account (requires Copilot subscription)

3. **Verify Configuration**
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
   - Type "Reload Window" and select it
   - This ensures all workspace settings are loaded

### Using Copilot Chat

Once set up, you can chat with AI that understands your codebase:

1. **Open Copilot Chat**
   - Press `Ctrl+Shift+I` (or `Cmd+Shift+I` on Mac)
   - Or click the chat icon in the sidebar

2. **Context-Aware Conversations**
   - Copilot Chat now has access to:
     - Project structure and architecture
     - Current file you're editing
     - Selected code snippets
     - Workspace configuration
   
3. **Example Prompts**
   ```
   "How does the resume block system work?"
   "Add a new feature to track application deadlines"
   "Explain the authentication flow in this app"
   "Help me add a new AI prompt for skill recommendations"
   "What improvements can we make to the job analysis feature?"
   ```

4. **Using File Context**
   - Open a file you want to discuss
   - Select code if you want to focus on specific lines
   - Ask Copilot about it: "Explain this code" or "How can I improve this?"

5. **Slash Commands**
   - `/explain` - Explain selected code
   - `/fix` - Suggest fixes for problems
   - `/tests` - Generate tests
   - `/new` - Scaffold new code
   - `/workspace` - Ask about workspace structure

### Understanding Workspace Context

The `.github/copilot-instructions.md` file provides Copilot with:
- Project architecture and technology stack
- Key features and how they work
- Coding conventions and patterns
- Common tasks and how to approach them
- Security and privacy considerations

This means Copilot will give you **context-aware suggestions** specific to JobFit, not generic React/TypeScript advice.

## Tips for Best Results

### 1. Be Specific
❌ "Improve the app"
✅ "Add a feature to export resume blocks as PDF"

### 2. Provide Context
❌ "Fix this"
✅ "This component is not updating when I change the job description. Here's the state management code: [paste code]"

### 3. Reference Files
✅ "Looking at src/services/geminiService.ts, how can I add a new AI prompt for cover letter generation?"

### 4. Use Multi-Step Conversations
```
You: "I want to add skill recommendations based on job descriptions"
Copilot: [provides approach]
You: "Where should I add the UI for this?"
Copilot: [suggests component]
You: "Show me the code for that component"
```

### 5. Ask for Explanations
- "Why does the app use two storage modes?"
- "What's the purpose of the resume block system?"
- "How does encryption work in this app?"

## Differences from Other AI Tools

### vs. Google's AI Tools
- **Google's AI**: May have direct code modification in their IDEs
- **VS Code + Copilot**: Chat-based suggestions, you apply changes
- **Advantage**: More control, review before applying

### Getting Code Applied
1. Copilot Chat suggests code
2. Click "Insert at Cursor" button in chat
3. Or click "Copy" and paste where needed
4. Review and modify as needed

## Troubleshooting

### Copilot Doesn't See My Code
- Ensure you've reloaded the window after installing extensions
- Check that files are saved (Copilot reads from disk)
- Open the specific file you want to discuss

### Generic Responses
- Reference `.github/copilot-instructions.md` explicitly: 
  "Based on the project guidelines in .github/copilot-instructions.md, how should I..."
- Provide more context about what you're trying to do
- Reference specific files or components

### Can't Install Copilot
- GitHub Copilot requires a subscription
- Individual ($10/mo) or Business plan
- Students/educators may get free access
- Alternative: Try Codeium or Tabnine (free options)

## Alternative: Using GitHub Models Directly

If you prefer a pure chat experience like Google's tools:

1. **GitHub Models** (Beta)
   - Visit https://github.com/marketplace/models
   - Chat with AI that can see your repos
   - More similar to Google's experience

2. **Cursor IDE**
   - Fork of VS Code with AI built-in
   - More integrated AI experience
   - Works with OpenAI, Anthropic, etc.

3. **Continue.dev**
   - VS Code extension
   - Chat with multiple AI models
   - Can read entire workspace

## Project-Specific AI Use Cases

Now that Copilot understands JobFit, you can ask:

### Feature Development
- "How can we add skill gap visualizations?"
- "Implement a feature to compare multiple jobs side-by-side"
- "Add email notifications for interview deadlines"

### Code Understanding
- "Walk me through how job analysis works end-to-end"
- "Explain the resume block storage architecture"
- "How does the app handle privacy and encryption?"

### Refactoring
- "How can I split this large component into smaller ones?"
- "Suggest improvements to the Gemini API integration"
- "How should I add TypeScript types for this new feature?"

### Testing
- "Generate tests for the storageService.ts"
- "What edge cases should I test for job URL scraping?"
- "Help me write integration tests for authentication"

### Debugging
- "Why is the theme not persisting on page reload?"
- "This error happens when uploading a resume: [error]"
- "Help me fix this TypeScript type error: [error]"

## Summary

You now have:
- ✅ GitHub Copilot with full workspace context
- ✅ Project-specific instructions for better suggestions
- ✅ Recommended extensions for best experience
- ✅ Workspace settings optimized for AI assistance

The AI now understands:
- Your project structure
- Technology choices
- Coding conventions
- Security and privacy requirements
- Current features and architecture

**Try it now**: Open Copilot Chat and ask "What are the main features of this JobFit application?" - you should get a detailed, accurate response!
