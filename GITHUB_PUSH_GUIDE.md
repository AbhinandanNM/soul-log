# How to Push Code to GitHub

## Step-by-Step Guide

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Fill in:
   - **Repository name**: `soul-log` (or any name you prefer)
   - **Description**: "Wellness journaling app with Google OAuth"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** check "Initialize with README" (we already have code)
4. Click **Create repository**

You'll see a page with setup instructions - **don't close it yet!** You'll need the repository URL.

### Step 2: Initialize Git Repository (if not already done)

Open PowerShell/Terminal in your project directory:

```powershell
cd C:\ANM\Cursor\thought-retrace-main\thought-retrace-main

# Initialize git repository
git init

# Check status
git status
```

### Step 3: Add All Files to Git

```powershell
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status
```

### Step 4: Make Your First Commit

```powershell
# Commit with a message
git commit -m "Initial commit: Soul Log app with Vercel deployment setup"

# Or with a more detailed message
git commit -m "Initial commit

- React frontend with Vite
- Express backend with Google OAuth
- PostgreSQL database setup
- Vercel deployment configuration
- API routes for serverless functions"
```

### Step 5: Add GitHub Remote

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```powershell
# Add GitHub as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify remote was added
git remote -v
```

**Example:**
```powershell
# If your GitHub username is "johndoe" and repo is "soul-log"
git remote add origin https://github.com/johndoe/soul-log.git
```

### Step 6: Push to GitHub

```powershell
# Push to GitHub (first time)
git branch -M main
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)

#### How to Create Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Give it a name like "Soul Log Deployment"
4. Select scopes: **repo** (full control of private repositories)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

### Step 7: Verify Push

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files!

---

## Complete Command Sequence

Here's everything in one go (copy and paste, then edit the remote URL):

```powershell
# Navigate to project
cd C:\ANM\Cursor\thought-retrace-main\thought-retrace-main

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Soul Log app with Vercel deployment setup"

# Add remote (REPLACE WITH YOUR REPO URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Future Updates

After making changes to your code:

```powershell
# See what changed
git status

# Add changed files
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

---

## Troubleshooting

### Error: "remote origin already exists"

```powershell
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Error: "failed to push some refs"

```powershell
# Pull first (if repo has initial commit)
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

### Error: "Authentication failed"

- Make sure you're using a **Personal Access Token**, not your password
- Token needs **repo** scope
- Try the SSH method instead (see below)

### Want to Use SSH Instead?

```powershell
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add SSH key to GitHub: Settings → SSH and GPG keys → New SSH key

# Use SSH URL instead
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

---

## Important Notes

✅ **Before pushing, make sure:**
- `.env` files are in `.gitignore` (they are!)
- No secrets or API keys are committed
- `node_modules` is ignored (it is!)

✅ **Never commit:**
- `.env` or `.env.local` files
- Database passwords
- API keys or secrets
- `node_modules` folder

✅ **Safe to commit:**
- Source code (`.ts`, `.tsx`, `.js`, `.jsx`)
- Configuration files (`package.json`, `vercel.json`)
- Documentation (`.md` files)

---

## Next Steps After Pushing

1. ✅ Push code to GitHub (you're doing this now!)
2. 📦 Deploy to Vercel (connect your GitHub repo)
3. 🔐 Set environment variables in Vercel
4. 🔗 Update Google OAuth redirect URI
5. 🚀 Your app will be live!

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `git init` | Initialize git repository |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit changes |
| `git remote add origin URL` | Add GitHub remote |
| `git push -u origin main` | Push to GitHub |
| `git status` | Check repository status |
| `git log` | View commit history |

Happy coding! 🚀

