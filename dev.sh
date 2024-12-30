TAG=${1:-latest}

docker run --rm -it \
    -p 8888:8888 \
    -p 443:443 \
    -v "$(pwd)"/server/data:/lottery/server/data/ \
     lottery:$TAG
