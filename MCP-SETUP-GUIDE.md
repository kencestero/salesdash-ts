# MCP Server Setup Guide for Claude Desktop

This guide will help you set up Model Context Protocol (MCP) servers to enhance Claude's capabilities with filesystem access, GitHub integration, database queries, web search, and more.

## Quick Start

1. **Copy the configuration file** to Claude Desktop's config location:
   ```
   C:\Users\kence\AppData\Roaming\Claude\claude_desktop_config.json
   ```

2. **Replace placeholder values** with your actual credentials

3. **Restart Claude Desktop**

## Detailed Setup Instructions

### Step 1: Locate Claude Desktop Config Directory

The configuration file needs to be placed in:
```
C:\Users\kence\AppData\Roaming\Claude\
```

If the folder doesn't exist, create it:
```powershell
mkdir "C:\Users\kence\AppData\Roaming\Claude"
```

### Step 2: Copy Configuration File

Copy the `claude_desktop_config.json` file from this project to the Claude config directory:

```powershell
copy "C:\Users\kence\salesdash-ts\claude_desktop_config.json" "C:\Users\kence\AppData\Roaming\Claude\claude_desktop_config.json"
```

### Step 3: Configure API Keys and Credentials

Edit the config file and replace the following placeholders:

#### GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`, `read:user`
4. Copy the token and replace `YOUR_GITHUB_TOKEN_HERE`

#### Database URL (Neon PostgreSQL)
1. Go to your Neon dashboard: https://console.neon.tech
2. Copy your connection string (looks like: `postgresql://user:pass@host.neon.tech/database`)
3. Replace `YOUR_NEON_DATABASE_URL_HERE`

#### Brave Search API Key (Optional but recommended)
1. Go to https://brave.com/search/api/
2. Sign up for API access
3. Copy your API key
4. Replace `YOUR_BRAVE_API_KEY_HERE`

### Step 4: Restart Claude Desktop

Close Claude Desktop completely and reopen it. The MCP servers will be loaded automatically.

## MCP Servers Included

### 1. **Filesystem** (No API key needed)
- **Purpose**: Read and write files in your project
- **Access**: `C:\Users\kence\salesdash-ts` and `C:\Users\kence\Documents`
- **Usage**: "Read the package.json file" or "Create a new component file"

### 2. **GitHub** (Requires: GitHub Token)
- **Purpose**: GitHub repository operations
- **Usage**: "Create a new issue" or "List pull requests"
- **Docs**: https://github.com/modelcontextprotocol/servers/tree/main/src/github

### 3. **PostgreSQL/Neon** (Requires: Database URL)
- **Purpose**: Query your Neon database
- **Usage**: "Show all users in the database" or "Count customers in CRM"
- **Docs**: https://github.com/modelcontextprotocol/servers/tree/main/src/postgres

### 4. **Brave Search** (Requires: Brave API Key)
- **Purpose**: Web search capabilities
- **Usage**: "Search for Next.js 14 documentation"
- **Docs**: https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search

### 5. **Playwright** (No API key needed)
- **Purpose**: Browser automation and testing
- **Usage**: "Navigate to mjsalesdash.com and take a screenshot"
- **Docs**: https://github.com/playwright/mcp

### 6. **Fetch** (No API key needed)
- **Purpose**: Make HTTP requests
- **Usage**: "Fetch data from this API endpoint"
- **Docs**: https://github.com/modelcontextprotocol/servers/tree/main/src/fetch

### 7. **Memory** (No API key needed)
- **Purpose**: Persistent memory across conversations
- **Usage**: Automatically remembers context between sessions
- **Docs**: https://github.com/modelcontextprotocol/servers/tree/main/src/memory

### 8. **Puppeteer** (No API key needed)
- **Purpose**: Advanced browser automation
- **Usage**: "Scrape data from this website"
- **Docs**: https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer

### 9. **Sequential Thinking** (No API key needed)
- **Purpose**: Enhanced reasoning capabilities
- **Usage**: Automatically improves complex problem-solving
- **Docs**: https://github.com/modelcontextprotocol/servers/tree/main/src/sequential-thinking

## Verification

After restarting Claude Desktop, you can verify MCP servers are loaded by asking:

```
"What MCP servers are available?"
```

Claude should list all configured servers.

## Testing Each Server

### Test Filesystem
```
"List all files in my salesdash-ts project"
```

### Test GitHub
```
"Show me the latest commit in kencestero/salesdash-ts"
```

### Test Database
```
"Query the User table and show the first 5 users"
```

### Test Brave Search
```
"Search for 'Next.js 14 App Router best practices'"
```

### Test Playwright
```
"Go to mjsalesdash.com and describe what you see"
```

### Test Fetch
```
"Fetch https://api.github.com/users/kencestero and show the response"
```

## Troubleshooting

### MCP Servers Not Loading

1. **Check file location**:
   ```powershell
   dir "C:\Users\kence\AppData\Roaming\Claude\claude_desktop_config.json"
   ```

2. **Validate JSON syntax**: Use https://jsonlint.com to check for errors

3. **Check Claude Desktop logs**:
   ```
   C:\Users\kence\AppData\Roaming\Claude\logs\
   ```

### "Command not found" Errors

Make sure Node.js and npm/npx are installed:
```powershell
node --version
npx --version
```

If not installed, download from: https://nodejs.org

### GitHub Authentication Fails

1. Verify token has correct permissions: `repo`, `read:org`, `read:user`
2. Token should not have quotes in the config file
3. Regenerate token if needed

### Database Connection Fails

1. Verify connection string format:
   ```
   postgresql://user:password@host.neon.tech:5432/database?sslmode=require
   ```
2. Test connection using `psql` or a database client
3. Check if IP is whitelisted in Neon dashboard

### Brave Search Not Working

1. Verify API key is active
2. Check API usage limits haven't been exceeded
3. You can skip this server if not needed

## Advanced Configuration

### Adding Custom Directories to Filesystem

Edit the `filesystem` server args:
```json
"args": [
  "-y",
  "@modelcontextprotocol/server-filesystem",
  "C:\\Users\\kence\\salesdash-ts",
  "C:\\Users\\kence\\Documents",
  "C:\\Users\\kence\\Desktop"
]
```

### Using Environment Variables

Instead of hardcoding values, you can use environment variables:

1. Set system environment variables:
   ```powershell
   setx GITHUB_TOKEN "your-token-here"
   setx DATABASE_URL "your-db-url-here"
   ```

2. Update config to use them:
   ```json
   "env": {
     "GITHUB_PERSONAL_ACCESS_TOKEN": "%GITHUB_TOKEN%"
   }
   ```

## Security Notes

- **Never commit** `claude_desktop_config.json` with real credentials
- Keep your API keys secure
- Use tokens with minimal required permissions
- Rotate tokens regularly
- The config file is local to your machine only

## Additional MCP Servers

You can add more MCP servers from the official registry:
https://github.com/modelcontextprotocol/servers

Popular options:
- `@modelcontextprotocol/server-slack` - Slack integration
- `@modelcontextprotocol/server-google-maps` - Google Maps
- `@modelcontextprotocol/server-sentry` - Error tracking
- `@modelcontextprotocol/server-sqlite` - SQLite databases

## Resources

- MCP Documentation: https://modelcontextprotocol.io
- MCP Servers Repository: https://github.com/modelcontextprotocol/servers
- Claude Desktop: https://claude.ai/download
- Report Issues: https://github.com/anthropics/claude-code/issues

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Claude Desktop logs
3. Visit the MCP documentation
4. Ask Claude for help debugging

---

**Last Updated**: 2025-01-24
**Compatible With**: Claude Desktop (Windows)
**Project**: MJ Cargo SalesDash
