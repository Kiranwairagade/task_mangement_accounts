/**
 * Auth Service for Workflow Pro
 * Handles Login, Signup, and Password Hashing
 */

/**
 * Signs up a new user.
 * @param {Object} data { username, password, email, role }
 */
function signupUser(data) {
  throw new Error('Self signup is disabled. Contact your admin to create an account.');
}

/**
 * Logs in a user via email.
 */
function loginUser(email, password) {
  const users = getRecords('DB_Users');
  const user = users.find(u => u.Email === email);
  
  if (!user) throw new Error('No account found for this email. Contact your admin.');
  
  const hash = hashPassword(password);
  if (user.PasswordHash !== hash) throw new Error('Invalid password');
  
  logActivity('Login', 'DB_Users', `User "${email}" logged in`, email);

  return {
    username: user.Email,
    role: user.Role,
    email: user.Email,
    displayName: user.Email.split('@')[0]
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
