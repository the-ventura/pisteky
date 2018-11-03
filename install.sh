# !/bin/sh
git checkout master
git pull
docker build -t pisteky .
docker stop pisteky
docker run -d --name pisteky pisteky
docker logs -f pisteky
