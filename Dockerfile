FROM node:lts

ENV APP_NAME="dronemap" \
	PORT=3333 \
	HOST=0.0.0.0 \
	NODE_ENV=production \
	APP_KEY=t0c5GoBssSB1RIWf5jAsq_MU0q8Zf23j \
	DB_CONNECTION=mysql \
	MYSQL_HOST=localhost \
	MYSQL_PORT=3306 \
	MYSQL_USER=dronemap \
	MYSQL_PASSWORD= \
	MYSQL_DB_NAME=dronemap \
	FILE_ROOT=/footage

RUN mkdir /footage

WORKDIR /app

COPY build .
COPY entry.sh .
COPY frontend frontend

RUN apt update && apt install -y ffmpeg
EXPOSE 3333

RUN npm ci --production
ENTRYPOINT ["/bin/bash", "entry.sh"]
