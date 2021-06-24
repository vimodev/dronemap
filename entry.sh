#! /bin/bash
sleep 10
node ace migration:run --force
node server.js

