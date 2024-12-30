TAG=$1

docker tag lottery:v2 collinhu/lottery:${TAG}
docker push collinhu/lottery:${TAG}
