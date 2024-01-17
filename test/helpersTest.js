const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.isObject(user, 'getUserByEmail should return an object');
    assert.equal(user.id, expectedUserID, 'User object should have the expected ID');
    assert.equal(user.email, "user@example.com", 'User object should have the expected email');
    assert.equal(user.password, "purple-monkey-dinosaur", 'User object should have the expected password');
  });
});