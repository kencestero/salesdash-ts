#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const server = new index_js_1.Server({
    name: "fireshare-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "ping",
                description: "Test tool that returns pong",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    if (request.params.name === "ping") {
        return {
            content: [
                {
                    type: "text",
                    text: "pong - fireshare MCP server is running!",
                },
            ],
        };
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("🔥 Fireshare MCP server listening...");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
