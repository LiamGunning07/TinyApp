
function getUserByEmail(email, users) {// HELPER FUNCTION FOR FINDING EXISTING USERS 
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

module.exports = ( getUserByEmail );