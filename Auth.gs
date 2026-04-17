/**
 * Auth Service for Workflow Pro
 * Handles Login, Signup, and Password Hashing
 */

/**
 * Signs up a new user.
 * @param {Object} data { username, password, email, role }
 */
function signupUser(data) {
  const users = getRecords('DB_Users');
  
  // Check if username already exists
  const existing = users.find(u => u.Username === data.username);
  if (existing) throw new Error('Username already exists');
  
  const payload = {
    Username: data.username,
    PasswordHash: hashPassword(data.password),
    Email: data.email,
    Role: data.role || 'Employee',
    CreatedAt: new Date().toISOString()
  };
  
  addRecord('DB_Users', payload);
  return { username: payload.Username, role: payload.Role };
}

/**
 * Logs in a user.
 * @param {string} username
 * @param {string} password
 */
function loginUser(username, password) {
  const users = getRecords('DB_Users');
  const user = users.find(u => u.Username === username);
  
  if (!user) throw new Error('User not found');
  
  const hash = hashPassword(password);
  if (user.PasswordHash !== hash) throw new Error('Invalid password');
  
  // Log the login event with the user's actual email
  logActivity('Login', 'DB_Users', `User "${username}" logged in`, user.Email || username);

  return {
    username: user.Username,
    role: user.Role,
    email: user.Email
  };
}

/**
 * Simple SHA-256 Hashing for GAS
 */
function hashPassword(pwd) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pwd);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) hashVal += 256;
    if (hashVal.toString(16).length == 1) txtHash += '0';
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
