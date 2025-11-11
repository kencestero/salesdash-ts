# Quick MCP Installation for Claude (Copy-Paste Ready)

## Step 1: Copy Config to Claude Directory

Open PowerShell and run:

```powershell
# Create Claude config directory if it doesn't exist
mkdir "C:\Users\kence\AppData\Roaming\Claude" -Force

# Copy the MCP configuration file
copy "C:\Users\kence\salesdash-ts\claude_desktop_config.json" "C:\Users\kence\AppData\Roaming\Claude\claude_desktop_config.json" -Force
```

## Step 2: Get Your API Keys

### GitHub Token (Required for GitHub features)
1. Visit: https://github.com/settings/tokens/new
2. Token name: `Claude MCP`
3. Select scopes: ☑️ `repo`, ☑️ `read:org`, ☑️ `read:user`
4. Click "Generate token"
5. **Copy the token immediately** (you won't see it again)

### Brave Search API (Optional - for web search)
1. Visit: https://brave.com/search/api/
2. Sign up for free tier
3. Copy API key

### Database URL (Already have this in your .env)
Your Neon PostgreSQL connection string from `.env` file

## Step 3: Edit the Config File

Open in notepad:
```powershell
notepad "C:\Users\kence\AppData\Roaming\Claude\claude_desktop_config.json"
```

Replace these placeholders:
- `YOUR_GITHUB_TOKEN_HERE` → Your GitHub token
- `YOUR_NEON_DATABASE_URL_HERE` → Your Neon database URL (from .env)
- `YOUR_BRAVE_API_KEY_HERE` → Your Brave API key (or remove this server if skipping)

## Step 4: Restart Claude Desktop

Close Claude completely and reopen.

## Step 5: Verify It Works

Ask Claude:
```
"What MCP tools do you have available?"
```

## One-Line Install (After Getting Keys)

Save this as `install-mcp.ps1`:

```powershell
# install-mcp.ps1
$GITHUB_TOKEN = Read-Host "Enter your GitHub token"
$DATABASE_URL = Read-Host "Enter your Neon database URL"
$BRAVE_KEY = Read-Host "Enter your Brave API key (or press Enter to skip)"

$config = @"
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\kence\\salesdash-ts"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "$DATABASE_URL"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "$BRAVE_KEY"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
"@

mkdir "C:\Users\kence\AppData\Roaming\Claude" -Force
$config | Out-File -FilePath "C:\Users\kence\AppData\Roaming\Claude\claude_desktop_config.json" -Encoding UTF8

Write-Host "✅ MCP configuration installed!" -ForegroundColor Green
Write-Host "🔄 Restart Claude Desktop to activate" -ForegroundColor Yellow
```

Run it:
```powershell
cd C:\Users\kence\salesdash-ts
powershell -ExecutionPolicy Bypass -File install-mcp.ps1
```

## What Each MCP Server Does

| Server | Purpose | API Key Needed? |
|--------|---------|-----------------|
| **filesystem** | Read/write project files | ❌ No |
| **github** | GitHub repo operations | ✅ Yes |
| **postgres** | Query Neon database | ✅ Yes |
| **brave-search** | Web search | ⚠️ Optional |
| **playwright** | Browser automation | ❌ No |
| **fetch** | HTTP requests | ❌ No |
| **memory** | Persistent context | ❌ No |

## Test Commands

After setup, try these:

```
"List files in my salesdash-ts project"
"Show recent commits in my GitHub repo"
"Query the User table from my database"
"Search the web for Next.js 14 best practices"
"Take a screenshot of mjsalesdash.com"
```

## Troubleshooting

**MCP servers not showing?**
- Check file exists: `dir "C:\Users\kence\AppData\Roaming\Claude\claude_desktop_config.json"`
- Validate JSON at: https://jsonlint.com
- Check Claude logs: `C:\Users\kence\AppData\Roaming\Claude\logs\`

**GitHub not working?**
- Verify token has `repo`, `read:org`, `read:user` scopes
- Token must be active (check https://github.com/settings/tokens)

**Database errors?**
- Test connection string with: `psql "YOUR_DATABASE_URL"`
- Make sure it includes `?sslmode=require`

**Need help?**
See full guide: [MCP-SETUP-GUIDE.md](./MCP-SETUP-GUIDE.md)

---

Done! Your Claude will now have superpowers 🚀
