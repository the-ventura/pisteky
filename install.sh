# !/bin/sh
git checkout master
git pull
docker build -t pisteky .
docker stop pisteky
docker run -d pisteky --name pisteky
docker logs -f pisteky