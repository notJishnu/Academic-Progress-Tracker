#!/bin/bash

# academic-progress-tracker folder structure setup

ROOT="academic-progress-tracker"

# Client (React + Vite + Tailwind) - just the top folder,
# since you'll scaffold this separately with `npm create vite@latest`
mkdir -p "$ROOT/client"

# Server structure
mkdir -p "$ROOT/server/config"
mkdir -p "$ROOT/server/models"
mkdir -p "$ROOT/server/routes"
mkdir -p "$ROOT/server/middleware"
mkdir -p "$ROOT/server/controllers"

# Server files
touch "$ROOT/server/config/db.js"
touch "$ROOT/server/middleware/protect.js"
touch "$ROOT/server/.env"
touch "$ROOT/server/server.js"

# Model files
touch "$ROOT/server/models/User.js"
touch "$ROOT/server/models/Section.js"
touch "$ROOT/server/models/Goal.js"
touch "$ROOT/server/models/DailyLog.js"
touch "$ROOT/server/models/Badge.js"

# Route files
touch "$ROOT/server/routes/auth.js"
touch "$ROOT/server/routes/sections.js"
touch "$ROOT/server/routes/goals.js"
touch "$ROOT/server/routes/logs.js"
touch "$ROOT/server/routes/badges.js"

echo "Folder structure created successfully under '$ROOT'."
