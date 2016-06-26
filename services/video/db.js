const neo4j = require('neo4j')
const bcrypt = require('bcrypt')
const async = require('async')
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
              query: 'MERGE (id: UniqueId {name:\'User\'}) ' +
                     'ON CREATE SET id.count = 1 ' +
                     'ON MATCH SET id.count = id.count + 1 ' +
                     'WITH id.count AS uid ' +
                     'CREATE(u:User {id: uid, email: {email}, password: {password}}) RETURN u',
              params: {
                email,
                password: hash,
              },
            }, (err, results) => {
              const result = results[0]
              if (err || !result) {
                reject(err || 'unexpected error')
              } else {
                const user = result.u.properties
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

function addSingleFriend(id1, id2, cb) {
  db.cypher({
    query: 'MATCH (u1:User {id: {id1}}), (u2:User {id: {id2}}) ' +
           'CREATE (u1) -[:FRIENDS]-> (u2) ' +
           'CREATE (u2) -[:FRIENDS]-> (u1)',
    params: {
      id1,
      id2,
    },
  }, cb)
}

function addFriends(userId, friendIds) {
  const addFriend = (friendId, cb) => addSingleFriend(userId, friendId, cb)
  return new Promise((resolve, reject) => {
    async.each(friendIds, addFriend, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function getFriends(id) {
  return new Promise((resolve, reject) => {
    db.cypher({
      query: 'MATCH (:User {id: {id}}) -[:FRIENDS]-> (f:User) RETURN f',
      params: {
        id,
      },
    }, (err, result) => {
      if (err) {
        reject(err)
      } else {
        if (result.length === 0) {
          resolve([])
        } else {
          const users = result.map(u => u.f.properties.id)
          resolve(users)
        }
      }
    })
  })
}


module.exports = {
  db,
  createUser,
  authenticateUser,
  addFriends,
  getFriends,
}

