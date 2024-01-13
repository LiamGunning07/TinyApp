const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => Math.random().toString(16).substr(6,6);
// Testing GRS: console.log(generateRandomString());

const users = { //Global Users Database
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const userId = req.cookies.userId;
  const templateVars = { 
    urls: urlDatabase,
    user: users[userId], //Updated username to pass user object instead 
    //username: req.cookies["username"] //Render username 
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userId;
  const templateVars = {
    user: users[userId], // Updated to pass entire user object instead
    //username: req.cookies["username"],//Render username 
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const longUrl = req.body.longUrl;
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = longUrl;
  console.log("Generated longUrl", longUrl);
  console.log('Generated shortURL:', shortUrl);
  console.log('Updated urlDatabase:', urlDatabase);

  res.redirect(`/urls/${shortUrl}`)
});

app.get("/urls/:id", (req, res) => {
  console.log("Url database", urlDatabase);
  const userId = req.cookies.userId;

  if(!userId) {// Error handling if user isnt logged in
    return res.redirect('/login');
  }

  const templateVars =
  {
    shortUrl: req.params.id,
    longUrl: urlDatabase[req.params.id],
    user: users[userId]// previous code username: req.cookies["username"]
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
  const shortUrlId = req.params.id;

  // Step 2: Look up the associated `longURL` in your `urlDatabase`
  const longUrl = urlDatabase[shortUrlId];

  // Step 3: If the `longURL` exists, redirect to it
  if (longUrl) {
    res.render('urls_show', { shortUrl: shortUrlId, longUrl: longUrl });
  } else {
    res.status(404).send('URL not found');
  }
});

// REGISTRATION ROUTES

app.get('/register', (req, res) => { // Render /register.ejs endpoint
  res.render('register');
})

app.post('/register', (req, res) => {
  const { email, password } = req.body; // Taking email and password values from req.body
  const userId = generateRandomString(); // Random ID number

  const newUser = { // New user object
    id: userId,
    email,
    password,
  };

  users[userId] = newUser; // Adding the new user to the user database

  res.cookie('userId', userId) // Storing userId as cookie
  res.redirect('/urls'); //redirect

  console.log('Users', users); // testing updated users object
});

app.post('/urls/:id/delete', (req, res) => {
  // Access the id from the request parameters
  const id = req.params.id;

  // Implement the logic to delete the URL by the id
  delete urlDatabase[id];
  // After deletion, redirect the client back to the URLs index page
  res.redirect('/urls');
});
app.post('/urls/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;
  const longUrl = req.body.longUrl;

  // Check if the shortUrl exists in the urlDatabase
  if (urlDatabase.hasOwnProperty(shortUrl)) {
    // Update the urlDatabase with the new longURL for the given shortURL
    urlDatabase[shortUrl] = longUrl;

    // Once the data is updated, redirect the client:
    res.redirect('/urls');
  } else {
    // If shortUrl doesn't exist, send a 404 response
    res.status(404).send("Short URL not found");
  }
});
app.post('/urls/:id', (req, res) => { // Updating longUrl Post route
  // Access the ':id' parameter using 'req.params'
  const shortUrlId = req.params.id;
  const longUrl = req.body.longUrl;
  if (!urlDatabase.hasOwnProperty(shortUrlId)) {
    return res.status(404).send("Short URL not found");
  }
  try{
    urlDatabase[shortUrlId] = longUrl;
    res.redirect('/urls')
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// LOGIN AND LOGOUT ROUTES

app.post('/login', (req, res) => {
  const userId = req.cookies.userId; //const username = req.body.username; // Making username input of username field
  res.cookie('userId', userId); // Storing username cookie as input of username
  res.redirect('/urls'); // Redirect to urls
})
app.post('/logout', (req, res) => {
  res.clearCookie('userId'); // clearing username cookie
  res.redirect('/urls');
})

// Local host port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});