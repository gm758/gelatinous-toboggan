// import utils from './utils.js'; // our custom middleware
import controller from '../db/controllers/index';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { promisifyAll } from 'bluebird';

import { writeVideoToDiskPipeline, getQuiltFromId } from './utils';
import Authentication from '../db/controllers/authentication';
import passportService from '../db/services/passport';

import passport from 'passport';
import phone from 'phone';
import async from 'async';
import AWS from 'aws-sdk';

import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from './config';
AWS.config.accessKeyId = AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3();
promisifyAll(s3);

const sqs = new AWS.SQS({
  region: 'us-west-2',
});
promisifyAll(sqs);

const requireAuth = passport.authenticate('jwt', { session: false });

export default (app) => {

  app.post('/api/createQuilt', (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { id, userIds } = JSON.parse(body);
      controller.postQuilt(id, userIds)
        .then(quiltId =>
          s3.getSignedUrlAsync('putObject', {
            Bucket: 'quiltmobileapp-oregon',
            Key: `upload_initial/quilt_${quiltId}.mov`,
            ContentType: 'video/quicktime',
          })
          .then(url => res.header('Content-Type', 'application/json').send({
            url,
            key: `quilt_${quiltId}.mov`
          }))
        )
        .catch(e => console.log(e));
    });
  });

  app.put('/api/updateQuilt/:quiltId', (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { userId } = JSON.parse(body);
      const quiltId = req.params.quiltId;
      controller.updateUserQuiltStatus(userId, quiltId)
        .then(quiltId =>
          s3.getSignedUrlAsync('putObject', {
            Bucket: 'quiltmobileapp-oregon',
            Key: `upload_next/quilt_${quiltId}/user_${userId}.mov`,
            ContentType: 'video/quicktime',
          })
          .then(url => res.header('Content-Type', 'application/json').send({
            url,
            key: `quilt_${quiltId}.mov`
          }))
        )
        .catch(e => console.log(e));
    });
  });

  app.post('/api/enqueueCreate', (req, res) => {
    sqs.sendMessageAsync({
      MessageBody: 'test',
      QueueUrl: 'https://sqs.us-west-1.amazonaws.com/434341646041/creationQueue',
    })
    .then((data) => {
      console.log(data);
      res.sendStatus(201);
    })
    .catch((error) => {
      console.log(error);

      res.sendStatus(404)
    });
  });


  app.get('/api/auth', (req, res) => {
    controller.verifyUser(req.query.usernameOrEmail, req.query.password)
      .then(user => {
        if (user) {
          res.status(200)
            .send({
              id: user.get('id'),
              username: user.get('username'),
              token: Authentication.tokenForUser(user.get('email'))
            })
        } else {
          res.status(400).send({errorMessage: 'Invalid Login'})
        }
      })
      .catch(error => res.status(500).send(`Failed verify user request: ${error}`));
  });

  // signup
  app.post('/api/auth', (req, res) => {
    controller.createUser(req.query.email, req.query.password)
      .then(user => {
        if (user) {
          res.status(201).send({
            id: user.get('id'),
            email: user.get('email'),
            token: Authentication.tokenForUser(user.get('email'))
          });
        } else {
          res.status(406).send('Email already exists');
        }
      })
      .catch(error => res.status(500).send(`Failed signup request: ${error}`));
  });

  app.put('/api/auth', requireAuth, (req, res) => {
    const user = req.user;
    let body = '';
    req.on('data', data => body += data);
    req.on('end', () => {
      user.update(JSON.parse(body))
        .then(() => res.status(204).send('Successfully updated'))
        .catch(error => res.status(500).send(`Failed to update user: ${error}`));
    })
  });

  app.get('/api/quilt', requireAuth, (req, res) => {
    const user = req.user;
    console.log(user)
    // if request query object is empty, send 404
    if (_.isEmpty(req.query)) {
      res.status(400).send('Failed to retrieve query string');
    } else {
      controller.getAllUserQuilts(user)
        .then(data => res.status(200).send(data))
        .catch(error => res.status(500).send(`Failed get quilt request: ${error}`));
    }
  });

  app.post('/api/quilt', requireAuth, (req, res) => {
    const data = JSON.parse(req.headers['meta-data']);
    writeVideoToDiskPipeline(req, res, data, true);
  });

  // TODO: clean up and optimize
  app.post('/api/cross', requireAuth, (req, res) => {
    const userId = req.query.userId;
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      data = JSON.parse(data);
      async.map(data, (contact, callback) => {
        controller.crossReference(contact.emails, contact.phoneNumbers)
          .then(user => {
            const id = user ? user.get('id') : null;
            const username = user ? user.get('username') : null;
            return callback(null, Object.assign(contact, { id, username }));
          })
      }, (err, results) => {
        if (err) {
          res.status(500).send(`Failed post cross reference request: ${err}`);
        } else {
          res.status(201).send(results.filter(contact => contact.id !== null && contact.id !== userId));
        }
      });
    })
  });

  // note: due to limitations of react-native-video, this route
  // expects the authentication token in the querystring
  app.get('/api/quilt/:id', requireAuth, (req, res) => {
    // res.sendFile(getQuiltFromId(req.params.id));
    const params = {Bucket: 'quiltmobileapp-oregon', Key: `quilts/quilt_${req.params.id}.mp4`};
    s3.getSignedUrlAsync('getObject', params)
      .then(url => {
        console.log(url)
        res.status(200).json({ url })
      })
  });

  app.post('/api/quilt/:id', requireAuth, (req, res) => {
    const data = JSON.parse(req.headers['meta-data']);
    data.quiltId = req.params.id;
    writeVideoToDiskPipeline(req, res, data, false);
  });

  app.get('/api/friends/:id', requireAuth, (req, res) => {
    if (_.isEmpty(req.params.id)) {
      res.status(400).send('Failed to retrieve user');
    } else {
      controller.getFriends(req.params.id)
        .then(data => res.status(200).send(data.get('Friend')))
        .catch(error => res.status(500).send(`Failed get friends request: ${error}`));
    }
  });

  app.post('/api/friends/:id', requireAuth, (req, res) => {
    const userId = req.params.id;
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    }).on('end', () => {
      const friends = JSON.parse(data).friends;
      controller.addFriends(userId, friends)
        .then(() => res.sendStatus(201))
        .catch(error => res.status(500).send(`Failed add friends request: ${error}`))
    })
  });

  app.get('/api/users', requireAuth, (req, res) => {
   const username = req.query.username;
   console.log(username)
   controller.getUser({ username })
     .then(user => {
       if (user) {
         res.status(200).send({
           id: user.get('id'),
           username: user.get('username'),
         });
       } else {
         res.sendStatus(400);
       }
    });
  })

  app.get('/api/user/:username', (req, res) => {
    if (_.isEmpty(req.params.username)) {
      res.status(400).send('Failed to retrieve user');
    } else {
      controller.getUser(req.params)
        .then(user => {
          if (user) {
            res.status(200).send(user)
          } else {
            res.status(404).send({ message: 'User does not exist'})
          }
        })
        .catch(error => res.status(500).send(`Failed get user request: ${error}`));
    }
  });

  app.get('/api/notifications/:id', (req, res) => {
    if (_.isEmpty(req.params.id)) {
      res.status(400).send('Failed to retrieve user');
    } else {
      controller.getUsersNotifs(req.params.id)
      .then((data) => {
        return res.status(200).send(data);
      })
      .catch((error) => res.status(500).send(`Failed request: ${error}`));
    }
  });
};
