-- Create the User table
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create the BlogPost table
CREATE TABLE "BlogPost" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  authorId INT REFERENCES "User"(id)
);

-- Create the Category table
CREATE TABLE "Category" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  postId INT REFERENCES "BlogPost"(id)
);

-- Create the Comment table
CREATE TABLE "Comment" (
  id SERIAL PRIMARY KEY,
  content TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  authorId INT REFERENCES "User"(id),
  postId INT REFERENCES "BlogPost"(id)
);

-- Create the Profile table
CREATE TABLE "Profile" (
  id SERIAL PRIMARY KEY,
  bio TEXT,
  avatar VARCHAR(255),
  userId INT UNIQUE REFERENCES "User"(id)
);
