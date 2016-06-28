DROP DATABASE IF EXISTS video;
CREATE DATABASE video;

USE video;

CREATE TABLE videos (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title varchar(15)
);

CREATE TABLE users (
  uuid INT NOT NULL PRIMARY KEY
);

CREATE TABLE users_videos (
  user_id INT NOT NULL,
  video_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  FOREIGN KEY (video_id) REFERENCES videos(id)
);

