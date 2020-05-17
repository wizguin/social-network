# Social Network

Twitter-like social network.

![Screenshot](https://i.imgur.com/4EfIvpA.png)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes.

### Prerequisites

What things you need to install the software.

* A MySQL Database
* [Node.js](https://nodejs.org/en/)

### Installing

A step by step series of examples that tell you how to get a development env running.

1. Clone this repository.

```console
git clone https://github.com/wizguin/social-network
```

2. Install node dependencies.

```console
npm install
```

3. Import social-network.sql to your MySQL database.

4. Rename nodemon_example.json to nodemon.json and update database configuration, SESSION_SECRET should be a complex randomly generated string.

```yaml
{
  "env": {
    "SESSION_SECRET": "secret",
    "DATABASE": "database",
    "USER": "user",
    "PASSWORD": "password",
    "HOST": "localhost",
    "DIALECT": "mysql"
  }
}
```

### Running the Dev Server

```console
npm run dev
```

## Built With

* [Node.js](https://nodejs.org/en/) 
* [Express](https://expressjs.com/)
* [Bootstrap](https://getbootstrap.com/) 
