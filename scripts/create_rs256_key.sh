#!/usr/bin/env bash

ssh-keygen -t rsa -P "" -b 2048 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
