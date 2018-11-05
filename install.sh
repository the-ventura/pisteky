# !/bin/sh
git checkout rl_score
git pull
docker build -t pisteky .
docker stop pisteky
docker run --rm -d --name pisteky pisteky
docker logs -f pisteky
