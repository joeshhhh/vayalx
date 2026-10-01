import re
with open('backend/src/config/env.js', 'r') as f:
    env_content = f.read()

# Remove the fallback for JWT_SECRET
env_content = env_content.replace("process.env.JWT_SECRET || 'vayalx_jwt_secret_dev_fallback_phase1'", "process.env.JWT_SECRET")

# Add validation check
validation = """// Validate required environment settings
if (!env.JWT_SECRET) {
  console.error('❌ [VAYALX Fatal Error]: JWT_SECRET is required but not defined in environment variables.');
  process.exit(1);
}
"""

env_content = env_content.replace("// Validate required environment settings", validation + "// Validate required environment settings")

with open('backend/src/config/env.js', 'w') as f:
    f.write(env_content)
