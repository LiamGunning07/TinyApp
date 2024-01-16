const express = require("express"); // Express Framework
const bcrypt = require("bcryptjs"); // Hashing Password
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => Math.random().toString(16).substr(6,6);
// Testing GRS: console.log(generateRandomString());

// const userId = generateRandomString(); // Random ID number
  function getUserByEmail(email) {// HELPER FUNCTION FOR FINDING EXISTING USERS 
    for (const userId in users) {
      if (users[userId].email === email) {
        return users[userId];
      }
    }
    return null;
  }
  function urlsForUser(id) { // HELPER FUNCTION FOR FINDING CORRESPONDING USER URLS
    const userUrls = {};
    for (const shortUrl in urlDatabase) {
      if (urlDatabase[shortUrl].userID === id) {
        userUrls[shortUrl] = urlDatabase[shortUrl];
      }
    }
    return userUrls;
  }

const users = { //Global Users Database
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "aaa",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// index page
app.get('/', function(req, res) {
  var mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  var tagline = "No programming concept is complete without a cute animal mascot.";

  res.render('pages/index', {
    mascots: mascots,
    tagline: tagline
  });

});

// about page
app.get('/about', function(req, res) {
  res.render('pages/about');
});

const urlDatabase = {
  'b2xVn2': {
    longUrl : "http://www.lighthouselabs.ca",
    userId: "userRandomID",
  },
  '9sm5xK': {
    longUrl: "http://www.google.com",
    userId: "userRandomID",
  },
};

app.get("/urls", (req, res) => {
  const userId = req.cookies.userId;
  if(!userId) {
    const errorMsg = "You must be logged in to view your URLs.";
    res.status(401).send(errorMsg);
    return;
  }
  function urlsForUser(userId) {
    const userUrls = {};
    for (const shortUrl in urlDatabase) {
      if (urlDatabase[shortUrl].userId === userId) {
        userUrls[shortUrl] = urlDatabase[shortUrl];
      }
    }
    return userUrls;
  }
  const templateVars = { 
    urls: urlsForUser(userId),
    user: users[userId],  
   };
   
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userId;

  const templateVars = {
    user: users[userId], // Updated to pass entire user object instead 
  };
  if (userId && users[userId]) { // If user isn't logged in redirect to login/register
  res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls", (req, res) => {
  const longUrl = req.body.longUrl;
  const shortUrl = generateRandomString();
  const userId = req.cookies.userId;
  if(userId && users[userId]) {
    urlDatabase[shortUrl] = {
      longUrl,
      userId,
    };
    res.redirect(`/urls/${shortUrl}`)
  } else {
    res.send('<html><body>You cannot shorten URLs without logging in.</body></html>');
  }
  console.log("Generated longUrl", longUrl);
  console.log('Generated shortUrl:', shortUrl);
  console.log('Updated urlDatabase:', urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  console.log("Url database", urlDatabase);
  const userId = req.cookies.userId;
  const shortUrl = req.params.id;
  const longUrl = req.body.longUrl;
  urlDatabase[shortUrl] = {
    longUrl,
    userId,
  };
  if(!userId) {// Error handling if user isnt logged in
    return res.redirect('/login');
  } else if (!(shortUrl !== urlDatabase)) {
    res.send('URL does not exist');
  }

  const templateVars =
  {
    shortUrl: req.params.id,
    longUrl: urlDatabase[shortUrl].longUrl,
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get("/urls/:id", (req, res) => {
  // Step 1: Capture the `id` from the route parameter
  const shortUrl = req.params.id;
  const longUrl = req.body.longUrl;
  const userId = req.cookies.userId;
  // Step 2: Look up the associated `longURL` in your `urlDatabase`
  urlDatabase[shortUrl] = {
    longUrl,
    userId,
  };
  // Step 3: If the `longURL` exists, redirect to it
  if (longUrl) {
    res.render('urls_show', { shortUrl: shortUrlId, longUrl: longUrl });
  } else {
    res.status(404).send('URL not found');
  }
});

// REGISTRATION/LOGIN GET ROUTES

app.get('/register', (req, res) => { // Render /register.ejs endpoint
  const userId = req.cookies.userId;

  if (userId && users[userId]) { // Doesn't Let logged in user access register page
    res.redirect('/urls');
  } else {
    res.render('register');
  }
})
app.get('/login', (req, res) => { // Render login.ejs
  const userId = req.cookies.userId;
  if(userId && users[userId]) { // Won't let logged in user access login page
    res.redirect('/urls');
  } else {
  res.render('login');
  }
})

app.post('/register', (req, res) => {
  const { email, password } = req.body; // Taking email and password values from req.body
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password,10);

if (!email || !password) { // ERROR HANDLING FOR EMPTY FIELDS
  return res.status(400).send("You must fill out both fields to register.");
}
if (getUserByEmail(email)) { // ERROR HANDLING IF EMAIL IS ALREADY REGISTERED
  return res.status(400).send("Email is already registered.");
}
const newUser = { // New user object
    id: userId,
    email,
    hashedPassword,
  };

  users[userId] = newUser; // Adding the new user to the user database

  res.cookie('userId', userId) // Storing userId as cookie
  res.redirect('/urls'); //redirect

  console.log('Users', users); // testing updated users object
});

app.post('/urls/:id/delete', (req, res) => {
  const userId = req.cookies.userId;
  const id = req.params.id; // Access the id from the request parameters
  if (userId !== urlDatabase[id].userId) {// URL does not exist or does not belong to the logged-in user
    const errorMessage = "You do not have permission to edit this URL.";
    res.status(403).send(errorMessage);
    return;
  }
  // Implement the logic to delete the URL by the id
  delete urlDatabase[id];
  // After deletion, redirect the client back to the URLs index page
  res.redirect('/urls');
});
app.post('/urls/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;
  const longUrl = req.body.longUrl;
  const userId = req.cookies.userId;

  // Check if the shortUrl exists in the urlDatabase
  if (urlDatabase.hasOwnProperty(shortUrl)) {
    // Update the urlDatabase with the new longURL for the given shortUrl
    urlDatabase[shortUrl] = {
      longUrl,
      userId,
    };

    // Once the data is updated, redirect the client:
    res.redirect('/urls');
  } else {
    // If shortUrl doesn't exist, send a 404 response
    res.status(404).send("Short URL not found");
  }
});
app.post('/urls/:id', (req, res) => { // Updating longUrl Post route
  // Access the ':id' parameter using 'req.params'
  const userId = req.cookies.userId;
  const id = req.params.id;
  const longUrl = req.body.longUrl;
  if (!urlDatabase.hasOwnProperty(shortUrlId)) {
    return res.status(404).send("Short URL not found");
  } else if (userId !== urlDatabase[id].userId) {// URL does not exist or does not belong to the logged-in user
    const errorMessage = "You do not have permission to edit this URL.";
    res.status(403).send(errorMessage);
    return;
  }
  
    urlDatabase[shortUrl] = {
      longUrl,
      userId,
    };
    res.redirect('/urls')
});

// LOGIN AND LOGOUT POST ROUTES

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password,10);
  if (!email || !password) {
    return res.status(400).send("Email and Password are required!")
  }
  const user = getUserByEmail(email);
  if (bcrypt.compareSync(password, hashedPassword)) {
    res.cookie('userId', user.id); // Storing userId cookie as input of user.id
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid Email or Password.");
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userId'); // clearing userId cookie 
  res.redirect('/login');
})

// Local host port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});