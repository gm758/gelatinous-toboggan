FROM debian
RUN apt-get update && apt-get install -y \
server/package.json \
app/package.json \
