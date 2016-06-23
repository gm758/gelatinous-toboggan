const neo4j = require('neo4j')
const bcrypt = require('bcrypt')
const db = new neo4j.GraphDatabase('http://neo4j:12345@localhost:7474');

function createUser(email, password) {
  return new Promise((resolve, reject) => {
    db.cypher({
      query: 'MATCH (u:User {email: {email}}) return u',
      params: {
        email,
      },
    }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        if (result.length > 0) {
          resolve(null)
          return
        }
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            reject(err)
          } else {
            db.cypher({
              query: 'CREATE(u:User {email: {email}, password: {password}}) RETURN u',
              params: {
                email,
                password: hash,
              },
            }, (err, results) => {
              const result = results[0]
              if (err || !result) {
                reject(err || 'unexpected error')
              } else {
                const user = result['u']
                resolve(user)
              }
            })
          }
        })
      }
    })
  })
}

// TODO: add support for usernames
function authenticateUser(usernameOrEmail, password) {
  return new Promise((resolve, reject) => {
    db.cypher({
      query: 'MATCH (u:User {email: {email}}) return u',
      params: {
        email: usernameOrEmail,
      },
    }, (err, results) => {
      if (err) {
        reject(err)
      } else {
        const result = results[0]
        if (!result) {
          resolve(false)
        } else {
          const user = result['u']
          bcrypt.compare(password, user.properties.password, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        }
      }
    })
  })
}

function addFriends(userId, friendIds) {
  return new Promise((resolve, reject) => {
    db.cypher({
      query: 'MATCH (u1:User {username:'admin'}), (r:Role {name:'ROLE_WEB_USER'})' +
             'CREATE (u)-[:FRIENDS]-(r)'
  })
}



module.exports = {
  db,
  createUser,
  authenticateUser,
}
