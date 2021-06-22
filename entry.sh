#! /bin/bash
sleep 5
node ace migration:run --force
node server.js

