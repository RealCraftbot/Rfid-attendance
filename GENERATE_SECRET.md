# Generate NEXTAUTH_SECRET - Multiple Methods

## Method 1: Using Git Bash (Recommended for Windows)
If you have Git installed, open **Git Bash** and run:

```bash
openssl rand -base64 32
```

**Output example:**
```
8J2mP9vK3nQ7wX5yZ1aB4cD6eF8gH0jKlM2nO4pQ6rS8tU0vW2xY4zA6bC8dE0fG2hI4jK6lM8nO0pQ2rS4=
```

## Method 2: Using PowerShell
Open **PowerShell** and run:

```powershell
# Generate random bytes and convert to base64
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Write-Output $secret
```

Or the one-liner version:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

## Method 3: Using Node.js
Open **Command Prompt** or **PowerShell** and run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Method 4: Using Online Generator
If you prefer, use this online tool:
- Go to: https://generate-secret.vercel.app/32
- Or: https://www.grc.com/passwords.htm
- Generate a 32-byte (256-bit) secret

## Method 5: Simple Random String (Less Secure but Works)
If nothing else works, you can manually create a long random string:

```bash
# In any terminal
node -e "console.log(Array.from({length: 64}, () => Math.random().toString(36)[2]).join(''))"
```

## Where to Use It

Copy the generated secret and add it to:

### 1. Your `.env` file (local development):
```env
NEXTAUTH_SECRET="paste-your-secret-here"
```

### 2. Railway Environment Variables (production):
1. Go to [railway.app](https://railway.app)
2. Click your project
3. Go to **Variables** tab
4. Add: `NEXTAUTH_SECRET` = `your-generated-secret`

## Example Complete Secret
```
Gz8Jk2mP5vN8qR3wX6yZ9aB2cD5eF7gH0jK3lM6nO9pQ2rS5tU8vW1xY4zA7bD0eG3hJ6kM9nP2qR5sT8uV1wX4yZ7aC0dF3gH6jK9lM2nO5pQ8rS1tU4vW7xY0zA3bD6eG9hJ2kM5nP8qR1sT4uV7wX0yZ3b
```

**Important:** Keep this secret safe! Don't share it publicly or commit it to GitHub.

## Quick Check

After setting it, verify in Railway:
- Variable name: `NEXTAUTH_SECRET`
- Value: Your 44-character base64 string (or longer random string)

The secret should look like random characters with letters, numbers, and sometimes + or / symbols.
